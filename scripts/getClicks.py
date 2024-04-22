import instaloader
import json
from datetime import datetime

username = 'ft.abhishekclicks'
data = []
previous_data = []
previous_data_set = set()
with open('./data/clicks.json', "r") as json_file:
    previous_data = json.load(json_file)
    for obj in previous_data:
        if "permalink" in obj:
            previous_data_set.add(obj["permalink"])

loader = instaloader.Instaloader()
profile = instaloader.Profile.from_username(loader.context, username)
for post in profile.get_posts():
    if post.shortcode in previous_data_set:
        data += previous_data
        print('yes')
        break
    if post.typename == 'GraphSidecar':
        for image in post.get_sidecar_nodes():
            image_data = {
                "url": image.display_url,
                "timestamp": post.date.strftime("%Y-%m-%d %H:%M:%S"),
                "permalink": post.shortcode
            }
            data.append(image_data)
    elif post.typename == 'GraphImage':
        image_data = {
            "url": post.url,
            "timestamp": post.date.strftime("%Y-%m-%d %H:%M:%S"),
            "permalink": post.shortcode
        }
        data.append(image_data)

with open('./data/clicks.json', "w") as json_file:
    json.dump(data, json_file, indent=4)