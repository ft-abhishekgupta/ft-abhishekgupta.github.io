import json
import requests

username = 'ft.abhishekclicks'
PROFILE_URL = f'https://www.instagram.com/{username}/'

previous_data = []
with open('./data/clicks.json', "r") as json_file:
    previous_data = json.load(json_file)

# Try to fetch new posts using instaloader (works in CI with login session)
try:
    import instaloader
    loader = instaloader.Instaloader()
    data = []
    previous_data_set = set()
    for obj in previous_data:
        if "permalink" in obj:
            previous_data_set.add(obj["permalink"])

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
    with open('./data/clicks.json', "w") as json_file:
        json.dump(data, json_file, indent=4)
    print(f"Updated clicks.json with {len(new_posts)} new + {len(previous_data)} existing = {len(data)} images")

except Exception as e:
    print(f"Instaloader unavailable ({e}), keeping existing data with {len(previous_data)} images")
    # Ensure all URLs use the permanent media URL format
    for item in previous_data:
        shortcode = item.get("permalink", "")
        if shortcode and "instagram.com/p/" not in item.get("url", ""):
            item["url"] = f"https://www.instagram.com/p/{shortcode}/media/?size=l"

    with open('./data/clicks.json', "w") as json_file:
        json.dump(previous_data, json_file, indent=4)
    print("Refreshed URLs to use permanent Instagram media format")