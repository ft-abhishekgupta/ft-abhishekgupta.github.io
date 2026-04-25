import cloudscraper
import json
import re
import html

scraper = cloudscraper.create_scraper()
games = []
seen = set()

for page in range(1, 20):
    url = f'https://backloggd.com/u/ftAbhishek/played?page={page}'
    r = scraper.get(url)
    print(f'Page {page}: status {r.status_code}')
    if r.status_code != 200:
        break

    pattern = r'<img class="card-img height" src="([^"]+)" alt="([^"]+)">'
    matches = re.findall(pattern, r.text)

    if not matches:
        print('  No games found, stopping.')
        break

    new_count = 0
    for img_url, name in matches:
        decoded_name = html.unescape(name)
        if decoded_name not in seen:
            seen.add(decoded_name)
            games.append({'name': decoded_name, 'imageUrl': img_url})
            new_count += 1

    print(f'  Found {len(matches)} games, {new_count} new (total: {len(games)})')

    if new_count == 0:
        print('  No new games on this page, stopping.')
        break

print(f'\nTotal unique games: {len(games)}')

with open('./data/games.json', 'w') as jsonFile:
    json.dump(games, jsonFile, indent=4)
    print("JSON File Written")
