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
  4. Download each image, resize it and store it under public/travel/ so the
     site serves small local files instead of full-size Wikimedia originals.
     `image` points at the local copy; `image_source` keeps the remote URL.

Run manually:
    python scripts/getTravel.py
    python scripts/getTravel.py --images-only   # just (re)localise images
"""
import io
import json
import os
import re
import sys
import time
import unicodedata
import urllib.parse
import urllib.request

from PIL import Image, ImageOps

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, "data")
DATA_PATH = os.path.join(DATA_DIR, "travel.json")
IMAGE_DIR = os.path.join(SCRIPT_DIR, "..", "public", "travel")
IMAGE_URL_PREFIX = "/travel/"
IMAGE_MAX_WIDTH = 1024
IMAGE_QUALITY = 76
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(IMAGE_DIR, exist_ok=True)

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
        city["image_source"] = thumb
        city["image_credit"] = "Wikipedia"


def slugify(text: str) -> str:
    ascii_text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", ascii_text.lower()).strip("-") or "city"


def wikimedia_thumb(url: str, width: int):
    """Turn an upload.wikimedia.org original URL into a resized-thumbnail URL.

    Returns None when the URL is not a Wikimedia original (or already a thumb).
    """
    parts = urllib.parse.urlsplit(url)
    if parts.netloc != "upload.wikimedia.org":
        return None
    m = re.match(r"^/wikipedia/([^/]+)/([0-9a-f])/([0-9a-f]{2})/([^/]+)$", parts.path)
    if not m:
        return None
    project, a, ab, filename = m.groups()
    suffix = ""
    lower = filename.lower()
    if lower.endswith(".svg"):
        suffix = ".png"
    elif lower.endswith((".tif", ".tiff")):
        suffix = ".jpg"
    return (f"https://upload.wikimedia.org/wikipedia/{project}/thumb/{a}/{ab}/"
            f"{filename}/{width}px-{filename}{suffix}")


def http_get_bytes(url: str) -> bytes:
    req = urllib.request.Request(url, headers={**HEADERS, "Accept": "image/*"})
    with urllib.request.urlopen(req, timeout=40) as resp:
        return resp.read()


def download_resized(remote: str, dest: str):
    """Fetch `remote` (preferring a pre-scaled Wikimedia thumb) and save a
    width-capped progressive JPEG to `dest`."""
    clean = urllib.parse.urlsplit(remote)._replace(query="", fragment="").geturl()
    candidates = [u for u in (wikimedia_thumb(clean, 1280), clean) if u]
    last_err = None
    for url in candidates:
        try:
            raw = http_get_bytes(url)
            break
        except Exception as e:  # thumb wider than the original 4xx's; fall back
            last_err = e
    else:
        raise last_err  # type: ignore[misc]

    img = Image.open(io.BytesIO(raw))
    img = ImageOps.exif_transpose(img)
    if img.mode in ("RGBA", "LA", "P"):
        img = img.convert("RGBA")
        bg = Image.new("RGB", img.size, (17, 17, 17))
        bg.paste(img, mask=img.split()[-1])
        img = bg
    elif img.mode != "RGB":
        img = img.convert("RGB")
    if img.width > IMAGE_MAX_WIDTH:
        img = img.resize(
            (IMAGE_MAX_WIDTH, round(img.height * IMAGE_MAX_WIDTH / img.width)),
            Image.LANCZOS,
        )
    img.save(dest, "JPEG", quality=IMAGE_QUALITY, optimize=True, progressive=True)


def localize_images(cities: list, previous: list):
    """Point every city's `image` at a local, resized copy in public/travel/.

    Files are only re-downloaded when the remote source changes. If Wikipedia
    is unreachable this run, the previous source/local copy is reused.
    """
    prev_by_key = {(c.get("source_id") or c["name"]): c for c in previous}
    used = set()
    for city in cities:
        key = city.get("source_id") or city["name"]
        prev = prev_by_key.get(key, {})
        remote = city.get("image_source")
        legacy = city.get("image") or ""
        if not remote and legacy.startswith("http"):
            remote = legacy
        if not remote:
            remote = prev.get("image_source")
        if not remote:
            city.pop("image", None)
            continue

        city["image_source"] = remote
        city.setdefault("image_credit", "Wikipedia")

        slug = slugify(f"{city['name']}-{city['country']}")
        name, n = slug, 2
        while name in used:
            name, n = f"{slug}-{n}", n + 1
        used.add(name)
        filename = f"{name}.jpg"
        dest = os.path.join(IMAGE_DIR, filename)

        fresh = os.path.exists(dest) and os.path.getsize(dest) > 1000
        if fresh and prev.get("image_source") == remote:
            city["image"] = IMAGE_URL_PREFIX + filename
            continue

        try:
            download_resized(remote, dest)
            city["image"] = IMAGE_URL_PREFIX + filename
            print(f"  img: {city['name']} -> {filename} "
                  f"({os.path.getsize(dest) // 1024} KB)")
        except Exception as e:
            print(f"  ! image failed for {city['name']}: {e}")
            city["image"] = IMAGE_URL_PREFIX + filename if fresh else remote
        time.sleep(0.3)

    keep = {f"{n}.jpg" for n in used}
    for f in os.listdir(IMAGE_DIR):
        if f.endswith(".jpg") and f not in keep:
            os.remove(os.path.join(IMAGE_DIR, f))
            print(f"  removed stale {f}")


def load_previous():
    if not os.path.exists(DATA_PATH):
        return []
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def write_cities(cities: list):
    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(cities, f, indent=2, ensure_ascii=False)
    print(f"\nWrote {len(cities)} cities -> {DATA_PATH}")


def images_only():
    cities = load_previous()
    print(f"Localising images for {len(cities)} cities…")
    localize_images(cities, cities)
    write_cities(cities)


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
    previous = load_previous()

    print("\nEnriching with Wikipedia…")
    for city in cities:
        enrich_with_wiki(city)
        time.sleep(0.4)

    print("\nDownloading images…")
    localize_images(cities, previous)
    write_cities(cities)


if __name__ == "__main__":
    if "--images-only" in sys.argv:
        images_only()
    else:
        main()
