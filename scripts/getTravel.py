"""Fetch visited cities from beeneverywhere.net and enrich with Wikipedia.

Source: https://beeneverywhere.net/user/40272

Strategy:
  beeneverywhere doesn't expose a public "all visits" API, but its SvelteKit
  data endpoint `/user/{id}/__data.json` includes the four cardinal extremes
  (most_southern / most_western / most_eastern / most_northern). We dedupe by
  city id and write each unique city to travel.json, then enrich with a
  Wikipedia thumbnail + summary.

  This works well when the user has up to ~4 cities (currently 3) and roughly
  one extreme per direction. If the user grows past that we may miss interior
  cities — at which point we should look for a richer endpoint or scrape the
  map JSON directly. For now this is a reasonable compromise.

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
BEEN_URL = f"https://beeneverywhere.net/user/{USER_ID}/__data.json"
WIKI_SUMMARY = "https://en.wikipedia.org/api/rest_v1/page/summary/{title}"

# Minimal ISO-3166 alpha-2 -> country name map; extend as travel grows.
COUNTRY_NAMES = {
    "IN": "India",
    "VN": "Vietnam",
    "US": "United States",
    "GB": "United Kingdom",
    "FR": "France",
    "DE": "Germany",
    "JP": "Japan",
    "CN": "China",
    "TH": "Thailand",
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

HEADERS = {
    "User-Agent": "ft-abhishekgupta-portfolio/1.0 (https://ft-abhishekgupta.github.io)",
    "Accept": "application/json",
}


def http_get_json(url: str):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode("utf-8"))


def fetch_wiki(title: str):
    url = WIKI_SUMMARY.format(title=urllib.parse.quote(title.replace(" ", "_")))
    try:
        return http_get_json(url)
    except Exception as e:
        print(f"  ! wiki failed for '{title}': {e}")
        return None


def resolve_sveltekit_data(payload):
    """SvelteKit __data.json uses a flattened, index-based pool.

    `nodes[i].data` is an array; index 0 is the root object whose values are
    integer indices into the same array. We resolve the second node (page
    data) recursively.
    """
    if not isinstance(payload, dict) or payload.get("type") != "data":
        return None
    nodes = payload.get("nodes") or []
    # The page-level node (second one) carries the profile + stats.
    page_node = next(
        (n for n in nodes if isinstance(n, dict) and n.get("type") == "data"
         and isinstance(n.get("data"), list) and n["data"]
         and isinstance(n["data"][0], dict) and "stats" in n["data"][0]),
        None,
    )
    if page_node is None:
        return None
    pool = page_node["data"]

    def resolve(idx):
        if not isinstance(idx, int) or idx < 0 or idx >= len(pool):
            return idx
        val = pool[idx]
        if isinstance(val, dict):
            return {k: resolve(v) for k, v in val.items()}
        if isinstance(val, list):
            return [resolve(v) for v in val]
        return val

    return resolve(0)


def extract_cities(resolved: dict):
    """Pull unique cities out of the most_* extremes."""
    stats = resolved.get("stats") or {}
    seen = {}  # id -> city dict
    for key in ("most_southern", "most_western", "most_eastern", "most_nothern"):
        c = stats.get(key)
        if not isinstance(c, dict) or not c.get("id"):
            continue
        if c["id"] in seen:
            continue
        seen[c["id"]] = c
    return list(seen.values())


def enrich_with_wiki(city: dict):
    """Add image, wiki_extract, wiki_url. Tolerates failures."""
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
    extract = data.get("extract")
    if extract:
        city["wiki_extract"] = extract
    page_url = (data.get("content_urls") or {}).get("desktop", {}).get("page")
    if page_url:
        city["wiki_url"] = page_url


def main():
    print(f"Fetching beeneverywhere data for user {USER_ID}…")
    payload = http_get_json(BEEN_URL)
    resolved = resolve_sveltekit_data(payload)
    if not resolved:
        raise SystemExit("Could not parse beeneverywhere __data.json structure")

    profile = resolved.get("profile") or {}
    raw_cities = extract_cities(resolved)
    print(f"  found {len(raw_cities)} unique cities for {profile.get('displayname', USER_ID)}")

    cities = []
    for c in raw_cities:
        cc = c.get("unp") or ""
        cities.append({
            "name": c["name"],
            "country": COUNTRY_NAMES.get(cc, cc or "Unknown"),
            "country_code": cc,
            "lat": c["lat"],
            "lng": c["lon"],
            "source": "beeneverywhere",
            "source_id": c["id"],
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
