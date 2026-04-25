import json
import os
import urllib.request
import time

username = 'ft.abhishekclicks'
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CLICKS_JSON = os.path.join(SCRIPT_DIR, 'data', 'clicks.json')
OUTPUT_DIR = os.path.join(SCRIPT_DIR, '..', 'public', 'clicks')

# Instagram Graph API token (set via env var or GitHub Actions secret)
IG_ACCESS_TOKEN = os.environ.get('IG_ACCESS_TOKEN', '')
IG_USER_ID = os.environ.get('IG_USER_ID', '')

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(os.path.join(SCRIPT_DIR, 'data'), exist_ok=True)

previous_data = []
if os.path.exists(CLICKS_JSON):
    with open(CLICKS_JSON, "r") as json_file:
        previous_data = json.load(json_file)

existing_shortcodes = {obj["permalink"] for obj in previous_data if "permalink" in obj}


def fetch_via_graph_api():
    """Fetch all posts via Instagram Graph API (requires IG_ACCESS_TOKEN and IG_USER_ID)."""
    if not IG_ACCESS_TOKEN or not IG_USER_ID:
        print("No IG_ACCESS_TOKEN or IG_USER_ID set, skipping Graph API")
        return None

    print("Fetching posts via Instagram Graph API...")
    all_posts = []
    url = (
        f"https://graph.facebook.com/v19.0/{IG_USER_ID}/media"
        f"?fields=id,media_type,media_url,permalink,timestamp,children{{media_url,media_type}}"
        f"&limit=100&access_token={IG_ACCESS_TOKEN}"
    )

    page = 1
    while url:
        print(f"  Page {page}...")
        try:
            req = urllib.request.Request(url)
            resp = urllib.request.urlopen(req, timeout=30)
            result = json.loads(resp.read().decode())
        except Exception as e:
            print(f"  Graph API error: {e}")
            break

        for item in result.get("data", []):
            media_type = item.get("media_type", "")
            permalink = item.get("permalink", "")
            timestamp = item.get("timestamp", "")
            # Extract shortcode from permalink: https://www.instagram.com/p/SHORTCODE/
            shortcode = permalink.rstrip("/").split("/")[-1] if permalink else ""

            if media_type == "CAROUSEL_ALBUM":
                # Carousel: get each child image
                children = item.get("children", {}).get("data", [])
                for child in children:
                    if child.get("media_type") == "IMAGE":
                        all_posts.append({
                            "url": child.get("media_url", ""),
                            "timestamp": timestamp,
                            "permalink": shortcode
                        })
            elif media_type == "IMAGE":
                all_posts.append({
                    "url": item.get("media_url", ""),
                    "timestamp": timestamp,
                    "permalink": shortcode
                })
            # Skip VIDEO type

        url = result.get("paging", {}).get("next")
        page += 1

    print(f"  Fetched {len(all_posts)} images via Graph API")
    return all_posts


def fetch_via_instaloader():
    """Fallback: fetch posts via instaloader (requires auth for full access)."""
    try:
        import instaloader
        loader = instaloader.Instaloader()
        profile = instaloader.Profile.from_username(loader.context, username)
        new_posts = []
        for post in profile.get_posts():
            if post.shortcode in existing_shortcodes:
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
        return new_posts
    except Exception as e:
        print(f"Instaloader unavailable ({e})")
        return None


# Try Graph API first, then instaloader, then fall back to existing data
graph_posts = fetch_via_graph_api()
if graph_posts is not None:
    # Deduplicate by shortcode, keeping first occurrence
    seen = set()
    data = []
    for p in graph_posts:
        key = p["permalink"]
        if key not in seen:
            seen.add(key)
            data.append(p)
    print(f"Graph API: {len(data)} unique posts")
else:
    insta_posts = fetch_via_instaloader()
    if insta_posts is not None:
        data = insta_posts + previous_data
        print(f"Instaloader: {len(insta_posts)} new + {len(previous_data)} existing = {len(data)} images")
    else:
        print(f"Keeping existing {len(previous_data)} images")
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