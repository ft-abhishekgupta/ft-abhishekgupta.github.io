import cloudscraper
import json
import re
import html
import os

scraper = cloudscraper.create_scraper()
games = {}

for page in range(1, 20):
    url = f'https://backloggd.com/u/ftAbhishek/played?page={page}'
    r = scraper.get(url)
    print(f'Page {page}: status {r.status_code}')
    if r.status_code != 200:
        break

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
            "backloggdUrl": f"https://backloggd.com/games/{slug}/" if slug else ""
        }

    new_count = len(games) - prev_count
    print(f'  Found {len(imgs)} games, {new_count} new (total: {len(games)})')

    if new_count == 0:
        print('  No new games on this page, stopping.')
        break

result = list(games.values())
print(f'\nTotal unique games: {len(result)}')
print(f'Games with ratings: {sum(1 for g in result if g["userRating"] is not None)}')

data_dir = os.path.join(os.path.dirname(__file__), 'data')
os.makedirs(data_dir, exist_ok=True)
with open(os.path.join(data_dir, 'games.json'), 'w', encoding='utf-8') as f:
    json.dump(result, f, indent=2, ensure_ascii=False)
    print("JSON File Written")
