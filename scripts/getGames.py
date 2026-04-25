import json
import re
import html
import os
import time

data_dir = os.path.join(os.path.dirname(__file__), 'data')
os.makedirs(data_dir, exist_ok=True)
json_path = os.path.join(data_dir, 'games.json')

# Load existing data as fallback
existing_data = []
if os.path.exists(json_path):
    with open(json_path, 'r', encoding='utf-8') as f:
        existing_data = json.load(f)
    print(f"Loaded {len(existing_data)} existing games as fallback")


def create_fetcher():
    """Try multiple HTTP clients to bypass Cloudflare."""
    # Try curl_cffi first (best TLS fingerprint impersonation)
    try:
        from curl_cffi import requests as cffi_requests
        session = cffi_requests.Session(impersonate="chrome")
        print("Using curl_cffi with chrome impersonation")
        return session
    except ImportError:
        print("curl_cffi not available")
    except Exception as e:
        print(f"curl_cffi init failed: {e}")

    # Fallback to cloudscraper
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
    """Fetch a URL with retries."""
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

games = {}

for page in range(1, 20):
    url = f'https://backloggd.com/u/ftAbhishek/played?page={page}'
    r = fetch_page(session, url)
    if not r:
        print(f'Page {page}: failed after retries')
        break

    print(f'Page {page}: status {r.status_code}')

    meta_pattern = r'game-cover\s+(?:user-rating\s+)?(?:"?\s*data-rating="(\d+)")?\s*[^>]*game_id="(\d+)">\s*<a href="/games/([^"]+)/"'
    img_pattern = r'<img class="card-img height" src="([^"]+)" alt="([^"]+)">'

    metas = re.findall(meta_pattern, r.text)
    imgs = re.findall(img_pattern, r.text)

    if not imgs:
        print('  No games found, stopping.')
        break

    prev_count = len(games)
    for i, (img_url, name_raw) in enumerate(imgs):
        name = html.unescape(name_raw).strip()
        if name in games:
            continue
        rating = None
        slug = ""
        game_id = ""
        if i < len(metas):
            r_val, gid, s = metas[i]
            rating = int(r_val) if r_val else None
            slug = s
            game_id = gid
        games[name] = {
            "name": name,
            "imageUrl": img_url,
            "slug": slug,
            "gameId": game_id,
            "userRating": rating,
            "backloggdUrl": f"https://backloggd.com/games/{slug}/" if slug else "",
            "year": None
        }

    new_count = len(games) - prev_count
    print(f'  Found {len(imgs)} games, {new_count} new (total: {len(games)})')

    if new_count == 0:
        print('  No new games on this page, stopping.')
        break

# If scraping returned nothing, keep existing data
if len(games) == 0:
    print("\nScraping returned 0 games. Keeping existing data unchanged.")
    exit(0)

# Merge years from existing data for games we already know about
existing_years = {g["name"]: g.get("year") for g in existing_data if g.get("year")}

# Scrape release year from each game's individual page
print(f'\nScraping release years for {len(games)} games...')
for i, (name, game) in enumerate(games.items()):
    # Use cached year if available
    if name in existing_years:
        game["year"] = existing_years[name]
        continue

    slug = game.get("slug", "")
    if not slug:
        continue
    game_url = f"https://backloggd.com/games/{slug}/"
    try:
        resp = fetch_page(session, game_url)
        if resp:
            m = re.search(r'<title>[^<]*\((\d{4})\)</title>', resp.text)
            if m:
                game["year"] = int(m.group(1))
        print(f'  [{i+1}/{len(games)}] {name}: {game["year"] or "no year"}')
    except Exception as e:
        print(f'  [{i+1}/{len(games)}] {name}: ERROR {e}')
    time.sleep(0.3)

result = list(games.values())
print(f'\nTotal unique games: {len(result)}')
print(f'Games with ratings: {sum(1 for g in result if g["userRating"] is not None)}')
print(f'Games with years: {sum(1 for g in result if g["year"] is not None)}')

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(result, f, indent=2, ensure_ascii=False)
    print("JSON File Written")
