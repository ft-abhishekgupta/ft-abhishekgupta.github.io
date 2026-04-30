"""Fetch all visited cities from beeneverywhere.net and enrich with Wikipedia.

Source: https://beeneverywhere.net/user/40272

Strategy:
  1. GET /query-visits/{user_id}
       Returns a GeoJSON FeatureCollection with one Point per visited city
       (rounded to ~0.01°) plus a `stats` object that names the four cardinal
       extremes (most_southern / most_western / most_eastern / most_nothern).
  2. For each visited point, look up the city name and country:
       - First, snap to one of the named cardinal extremes (handles 4 of 7
         cities for the current profile and gives us proper diacritics).
       - Otherwise, POST /_api/nominatim/moveend with a small viewbox around
         the point. The API returns the tracked city in that bounding box
         with a localised name + country. This is the same call the
         beeneverywhere map itself makes when it pans, so we get the
         canonical city name without hitting OSM Nominatim externally.
  3. Enrich each city with a Wikipedia thumbnail.

Run manually:
    python scripts/getTravel.py
"""
import json
import os
import time
import urllib.parse
import urllib.request

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, "data")
DATA_PATH = os.path.join(DATA_DIR, "travel.json")
os.makedirs(DATA_DIR, exist_ok=True)

USER_ID = "40272"
BASE = "https://beeneverywhere.net"
QUERY_VISITS_URL = f"{BASE}/query-visits/{USER_ID}"
MOVEEND_URL = f"{BASE}/_api/nominatim/moveend"
WIKI_SUMMARY = "https://en.wikipedia.org/api/rest_v1/page/summary/{title}"

# Map the 2-letter ISO codes beeneverywhere uses (UNP) onto display names.
# Extend as travel grows; falls back to the code if missing.
COUNTRY_NAMES = {
    "IN": "India",
    "VN": "Vietnam",
    "TH": "Thailand",
    "US": "United States",
    "GB": "United Kingdom",
    "FR": "France",
    "DE": "Germany",
    "JP": "Japan",
    "CN": "China",
    "SG": "Singapore",
    "AE": "United Arab Emirates",
    "NL": "Netherlands",
    "IT": "Italy",
    "ES": "Spain",
    "ID": "Indonesia",
    "AU": "Australia",
    "NP": "Nepal",
    "LK": "Sri Lanka",
    "BT": "Bhutan",
    "BD": "Bangladesh",
    "MY": "Malaysia",
    "PH": "Philippines",
    "KR": "South Korea",
}

# Reverse-mapping (display name -> 2-letter code) for the moveend response,
# whose `country` field is a localised display name (e.g. "Viet Nam").
COUNTRY_CODE_BY_NAME = {
    "India": "IN",
    "Viet Nam": "VN",
    "Vietnam": "VN",
    "Thailand": "TH",
    "United States": "US",
    "United Kingdom": "GB",
    "France": "FR",
    "Germany": "DE",
    "Japan": "JP",
    "China": "CN",
    "Singapore": "SG",
    "United Arab Emirates": "AE",
    "Netherlands": "NL",
    "Italy": "IT",
    "Spain": "ES",
    "Indonesia": "ID",
    "Australia": "AU",
    "Nepal": "NP",
    "Sri Lanka": "LK",
    "Bhutan": "BT",
    "Bangladesh": "BD",
    "Malaysia": "MY",
    "Philippines": "PH",
    "South Korea": "KR",
    "Korea, Republic of": "KR",
}

HEADERS = {
    "User-Agent": "ft-abhishekgupta-portfolio/1.0 (https://ft-abhishekgupta.github.io)",
    "Accept": "application/json",
}

# Match tolerance when snapping query-visits coords (rounded to 0.01°) to the
# higher-precision coords in stats.most_*.
COORD_TOLERANCE = 0.05


def http_get_json(url: str):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode("utf-8"))


def http_post_multipart_json(url: str, fields: dict):
    boundary = "----ftBoundary7XfBz9"
    parts = []
    for name, value in fields.items():
        parts.append(f"--{boundary}\r\n"
                     f"Content-Disposition: form-data; name=\"{name}\"\r\n\r\n"
                     f"{value}\r\n")
    parts.append(f"--{boundary}--\r\n")
    body = "".join(parts).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={
            **HEADERS,
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode("utf-8"))


def fetch_wiki(title: str):
    url = WIKI_SUMMARY.format(title=urllib.parse.quote(title.replace(" ", "_")))
    try:
        return http_get_json(url)
    except Exception as e:
        print(f"  ! wiki failed for '{title}': {e}")
        return None


def lookup_city_via_moveend(lon: float, lat: float):
    """Ask beeneverywhere's moveend API for the tracked city around (lon, lat).

    Returns (name, country_display_name, osm_uid, precise_lon, precise_lat) or None.
    """
    pad = 0.4
    viewbox = f"{lon - pad},{lat - pad},{lon + pad},{lat + pad}"
    try:
        features = http_post_multipart_json(MOVEEND_URL, {
            "page": f"/user/{USER_ID}",
            "viewbox": viewbox,
        })
    except Exception as e:
        print(f"  ! moveend failed for ({lon},{lat}): {e}")
        return None
    if not isinstance(features, list):
        return None
    # Pick the feature whose centre is closest to the requested point.
    best = None
    best_d = None
    for f in features:
        flon, flat = f.get("lon"), f.get("lat")
        if flon is None or flat is None:
            continue
        d = (flon - lon) ** 2 + (flat - lat) ** 2
        if best_d is None or d < best_d:
            best_d = d
            best = f
    if best is None:
        return None
    return (
        best.get("name"),
        best.get("country"),
        best.get("osm_uid"),
        best.get("lon"),
        best.get("lat"),
    )


def enrich_with_wiki(city: dict):
    """Add image (best-effort). Tolerates failures."""
    name = city["name"]
    country = city["country"]
    print(f"  wiki: {name}, {country}")
    data = fetch_wiki(f"{name}, {country}")
    if not data or data.get("type") == "disambiguation":
        time.sleep(0.4)
        data = fetch_wiki(name)
    if not data:
        return
    thumb = (data.get("originalimage") or data.get("thumbnail") or {}).get("source")
    if thumb:
        city["image"] = thumb
        city["image_credit"] = "Wikipedia"


def main():
    print(f"Fetching beeneverywhere visits for user {USER_ID}…")
    payload = http_get_json(QUERY_VISITS_URL)
    features = payload.get("features") or []
    stats = payload.get("stats") or {}

    # Build a lookup of the 4 named extremes from stats.
    named_extremes = []
    for key in ("most_southern", "most_western", "most_eastern", "most_nothern"):
        c = stats.get(key)
        if isinstance(c, dict) and c.get("id"):
            named_extremes.append(c)

    def find_extreme(lon, lat):
        for c in named_extremes:
            if (abs(c["lon"] - lon) <= COORD_TOLERANCE
                    and abs(c["lat"] - lat) <= COORD_TOLERANCE):
                return c
        return None

    print(f"  found {len(features)} visited points "
          f"({len(named_extremes)} named via cardinal extremes)")

    cities = []
    seen_ids = set()
    for feat in features:
        coords = (feat.get("geometry") or {}).get("coordinates") or []
        if len(coords) < 2:
            continue
        lon, lat = float(coords[0]), float(coords[1])

        extreme = find_extreme(lon, lat)
        if extreme is not None:
            name = extreme["name"]
            cc = extreme.get("unp") or ""
            country = COUNTRY_NAMES.get(cc, cc or "Unknown")
            source_id = extreme["id"]
            precise_lon = extreme["lon"]
            precise_lat = extreme["lat"]
        else:
            looked_up = lookup_city_via_moveend(lon, lat)
            if looked_up is None:
                print(f"  ! could not name point ({lon},{lat}); skipping")
                continue
            name, country_display, osm_uid, precise_lon, precise_lat = looked_up
            cc = COUNTRY_CODE_BY_NAME.get(country_display or "", "")
            country = COUNTRY_NAMES.get(cc, country_display or "Unknown")
            source_id = osm_uid or f"point-{lon:.4f}-{lat:.4f}"
            time.sleep(0.4)  # be polite to beeneverywhere

        if source_id in seen_ids:
            continue
        seen_ids.add(source_id)

        cities.append({
            "name": name,
            "country": country,
            "country_code": cc,
            "lat": precise_lat if precise_lat is not None else lat,
            "lng": precise_lon if precise_lon is not None else lon,
            "source": "beeneverywhere",
            "source_id": source_id,
        })

    cities.sort(key=lambda x: (x["country"], x["name"]))

    print("\nEnriching with Wikipedia…")
    for city in cities:
        enrich_with_wiki(city)
        time.sleep(0.4)

    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(cities, f, indent=2, ensure_ascii=False)
    print(f"\nWrote {len(cities)} cities -> {DATA_PATH}")


if __name__ == "__main__":
    main()
