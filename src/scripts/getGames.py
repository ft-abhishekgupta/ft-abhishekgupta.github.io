import requests
import json
from bs4 import BeautifulSoup

pageUrl = 'https://www.backloggd.com/u/ftAbhishek/games/title/type:played?page=1'

addedGames = set()
gameInfoList = []
for i in range(1,100):
    url = 'https://www.backloggd.com/u/ftAbhishek/games/title/type:played?page='+str(i)
    r = requests.get(url)
    soup = BeautifulSoup(r.content, 'html5lib')
    gameListDiv = soup.find('div', id='game-lists')
    gameDivs = gameListDiv.find_all('div', class_='card')
    flag = False
    for div in gameDivs:
        game_name = div.find('div', class_='game-text-centered').text.strip()
        game_image_url = div.find('img')['src']
        if game_image_url in addedGames:
            flag = True
            break
        game_info = {
            'name': game_name,
            'image_url': game_image_url
        }
        gameInfoList.append(game_info)
        addedGames.add(game_image_url)
    print(i)
    print(len(gameInfoList))
    if(flag):
        break

with open('games.json', 'w') as json_file:
    json.dump(gameInfoList, json_file, indent=4)
