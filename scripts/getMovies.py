"""Scrape Letterboxd films for CI (cloudscraper, no browser needed)."""
import cloudscraper
import json
import re
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
USERNAME = "ftabhishekgupta"
BASE_URLS = {
    "watched": f"https://letterboxd.com/{USERNAME}/films/",
    "watchlist": f"https://letterboxd.com/{USERNAME}/watchlist/",
}

scraper = cloudscraper.create_scraper()
all_items = []
seen_slugs = set()

for label, base_url in BASE_URLS.items():
    page_num = 1
    while True:
        url = base_url if page_num == 1 else f"{base_url}page/{page_num}/"
        print(f"[{label}] Page {page_num}: {url}")
        r = scraper.get(url)
        if r.status_code != 200:
            print(f"  Status {r.status_code}, stopping")
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

            # Extract poster image and upscale
            img_m = re.search(r'src="(https://a\.ltrbxd\.com/resized/[^"]+)"', block)
            image_url = ""
            if img_m:
                image_url = re.sub(r'-0-70-0-105-crop', '-0-230-0-345-crop', img_m.group(1))

            # Extract user rating (rated-N class, scale 1-10)
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

print(f"\nTotal: {len(all_items)} films")
watched = [i for i in all_items if i["source"] == "watched"]
watchlist = [i for i in all_items if i["source"] == "watchlist"]
print(f"Watched: {len(watched)}, Watchlist: {len(watchlist)}")

data_dir = os.path.join(SCRIPT_DIR, "data")
os.makedirs(data_dir, exist_ok=True)
with open(os.path.join(data_dir, "movies.json"), "w", encoding="utf-8") as f:
    json.dump(all_items, f, indent=2, ensure_ascii=False)
print("Saved to data/movies.json")
