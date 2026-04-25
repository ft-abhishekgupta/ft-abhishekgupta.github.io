"""Scrape Letterboxd films for CI with fallback to existing data."""
import json
import re
import os
import time

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
USERNAME = "ftabhishekgupta"
BASE_URLS = {
    "watched": f"https://letterboxd.com/{USERNAME}/films/",
    "watchlist": f"https://letterboxd.com/{USERNAME}/watchlist/",
}

data_dir = os.path.join(SCRIPT_DIR, "data")
os.makedirs(data_dir, exist_ok=True)
json_path = os.path.join(data_dir, "movies.json")

existing_data = []
if os.path.exists(json_path):
    with open(json_path, 'r', encoding='utf-8') as f:
        existing_data = json.load(f)
    print(f"Loaded {len(existing_data)} existing movies as fallback")


def create_fetcher():
    try:
        from curl_cffi import requests as cffi_requests
        session = cffi_requests.Session(impersonate="chrome")
        print("Using curl_cffi with chrome impersonation")
        return session
    except ImportError:
        print("curl_cffi not available")
    except Exception as e:
        print(f"curl_cffi init failed: {e}")
    try:
        import cloudscraper
        scraper = cloudscraper.create_scraper(
            browser={'browser': 'chrome', 'platform': 'linux', 'mobile': False}
        )
        print("Using cloudscraper")
        return scraper
    except Exception as e:
        print(f"cloudscraper init failed: {e}")
    return None


def fetch_page(session, url, retries=2):
    for attempt in range(retries + 1):
        try:
            r = session.get(url, timeout=20)
            if r.status_code == 200:
                return r
            print(f"  Attempt {attempt+1}: status {r.status_code}")
        except Exception as e:
            print(f"  Attempt {attempt+1}: error {e}")
        if attempt < retries:
            time.sleep(2)
    return None


session = create_fetcher()
if not session:
    print("ERROR: No HTTP client available. Keeping existing data.")
    exit(0)

all_items = []
seen_slugs = set()

for label, base_url in BASE_URLS.items():
    page_num = 1
    while True:
        url = base_url if page_num == 1 else f"{base_url}page/{page_num}/"
        print(f"[{label}] Page {page_num}: {url}")
        r = fetch_page(session, url)
        if not r:
            print(f"  Failed after retries, stopping")
            break

        blocks = re.split(r'class="griditem"', r.text)
        count = 0
        for block in blocks[1:]:
            name_m = re.search(r'data-item-name="([^"]+)"', block)
            slug_m = re.search(r'data-item-slug="([^"]+)"', block)
            if not name_m or not slug_m:
                continue
            slug = slug_m.group(1)
            if slug in seen_slugs:
                continue
            seen_slugs.add(slug)
            count += 1
            full_name = name_m.group(1)
            year_m = re.search(r'\((\d{4})\)', full_name)
            year = int(year_m.group(1)) if year_m else None
            clean_name = re.sub(r'\s*\(\d{4}\)\s*$', '', full_name).strip()
            img_m = re.search(r'src="(https://a\.ltrbxd\.com/resized/[^"]+)"', block)
            image_url = ""
            if img_m:
                image_url = re.sub(r'-0-70-0-105-crop', '-0-230-0-345-crop', img_m.group(1))
            rating_m = re.search(r'rated-(\d+)', block)
            user_rating = int(rating_m.group(1)) if rating_m else None
            all_items.append({
                "name": clean_name,
                "slug": slug,
                "year": year,
                "imageUrl": image_url,
                "userRating": user_rating,
                "letterboxdUrl": f"https://letterboxd.com/film/{slug}/",
                "source": label
            })
        print(f"  Found {count} new films")
        if count == 0:
            break
        has_next = bool(re.search(rf'/page/{page_num + 1}/', r.text))
        if not has_next:
            break
        page_num += 1

if len(all_items) == 0:
    print("\nScraping returned 0 movies. Keeping existing data unchanged.")
    exit(0)

# Fetch poster images from individual film pages (lazy-loaded on list page)
existing_posters = {m["slug"]: m["imageUrl"] for m in existing_data if m.get("imageUrl")}
missing_posters = [item for item in all_items if not item["imageUrl"]]
print(f"\nFetching poster images for {len(missing_posters)} films...")

for i, item in enumerate(missing_posters):
    slug = item["slug"]
    # Use cached poster if available
    if slug in existing_posters:
        item["imageUrl"] = existing_posters[slug]
        continue

    film_url = f"https://letterboxd.com/film/{slug}/"
    try:
        resp = fetch_page(session, film_url, retries=1)
        if resp:
            # Try film-poster URL first (best quality)
            poster_m = re.search(r'https://a\.ltrbxd\.com/resized/film-poster/[^\s"\']+', resp.text)
            if poster_m:
                item["imageUrl"] = poster_m.group(0)
            else:
                # Fallback to og:image
                og_m = re.search(r'og:image.*?content="([^"]+)"', resp.text)
                if og_m:
                    item["imageUrl"] = og_m.group(1)
        print(f"  [{i+1}/{len(missing_posters)}] {item['name']}: {'OK' if item['imageUrl'] else 'no poster'}")
    except Exception as e:
        print(f"  [{i+1}/{len(missing_posters)}] {item['name']}: ERROR {e}")
    time.sleep(0.3)

print(f"\nTotal: {len(all_items)} films")
watched = [i for i in all_items if i["source"] == "watched"]
watchlist = [i for i in all_items if i["source"] == "watchlist"]
print(f"Watched: {len(watched)}, Watchlist: {len(watchlist)}")

with open(json_path, "w", encoding="utf-8") as f:
    json.dump(all_items, f, indent=2, ensure_ascii=False)
print("Saved to data/movies.json")