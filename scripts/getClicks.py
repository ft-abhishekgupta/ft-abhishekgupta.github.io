import json
import os
import urllib.request
import time

username = 'ft.abhishekclicks'
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CLICKS_JSON = os.path.join(SCRIPT_DIR, 'data', 'clicks.json')
OUTPUT_DIR = os.path.join(SCRIPT_DIR, '..', 'public', 'clicks')

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(os.path.join(SCRIPT_DIR, 'data'), exist_ok=True)

previous_data = []
if os.path.exists(CLICKS_JSON):
    with open(CLICKS_JSON, "r") as json_file:
        previous_data = json.load(json_file)

# Try to fetch new posts using instaloader (works in CI with login session)
try:
    import instaloader
    loader = instaloader.Instaloader()
    previous_data_set = {obj["permalink"] for obj in previous_data if "permalink" in obj}

    profile = instaloader.Profile.from_username(loader.context, username)
    new_posts = []
    for post in profile.get_posts():
        if post.shortcode in previous_data_set:
            break
        if post.typename == 'GraphSidecar':
            for image in post.get_sidecar_nodes():
                new_posts.append({
                    "url": f"https://www.instagram.com/p/{post.shortcode}/media/?size=l",
                    "timestamp": post.date.strftime("%Y-%m-%d %H:%M:%S"),
                    "permalink": post.shortcode
                })
        elif post.typename == 'GraphImage':
            new_posts.append({
                "url": f"https://www.instagram.com/p/{post.shortcode}/media/?size=l",
                "timestamp": post.date.strftime("%Y-%m-%d %H:%M:%S"),
                "permalink": post.shortcode
            })

    data = new_posts + previous_data
    print(f"Updated with {len(new_posts)} new + {len(previous_data)} existing = {len(data)} images")

except Exception as e:
    print(f"Instaloader unavailable ({e}), keeping existing {len(previous_data)} images")
    data = previous_data
    for item in data:
        shortcode = item.get("permalink", "")
        if shortcode and "instagram.com/p/" not in item.get("url", ""):
            item["url"] = f"https://www.instagram.com/p/{shortcode}/media/?size=l"

# Download images locally
print(f"\nDownloading {len(data)} images to public/clicks/...")
failed = []
for i, click in enumerate(data):
    shortcode = click["permalink"]
    url = click["url"]
    filepath = os.path.join(OUTPUT_DIR, f"{shortcode}.jpg")
    click["localPath"] = f"/clicks/{shortcode}.jpg"

    if os.path.exists(filepath) and os.path.getsize(filepath) > 1000:
        continue

    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
        resp = urllib.request.urlopen(req, timeout=15)
        img_data = resp.read()
        if len(img_data) < 1000:
            failed.append(shortcode)
            continue
        with open(filepath, "wb") as out:
            out.write(img_data)
        print(f"  [{i+1}/{len(data)}] Downloaded {shortcode}")
    except Exception as ex:
        print(f"  [{i+1}/{len(data)}] FAILED {shortcode}: {ex}")
        failed.append(shortcode)
    time.sleep(0.3)

with open(CLICKS_JSON, "w") as json_file:
    json.dump(data, json_file, indent=2, ensure_ascii=False)

print(f"\nDone! {len(data)} total, {len(failed)} failed")
if failed:
    print(f"  Failed: {failed}")