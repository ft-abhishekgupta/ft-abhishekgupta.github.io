import requests
import json
from bs4 import BeautifulSoup

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
        gameName = div.find('div', class_='game-text-centered').text.strip()
        gameImageUrl = div.find('img')['src']
        if gameImageUrl in addedGames:
            flag = True
            break
        game_info = {
            'name': gameName,
            'imageUrl': gameImageUrl
        }
        gameInfoList.append(game_info)
        addedGames.add(gameImageUrl)
    if(flag):
        print("Total Games: "+str(len(gameInfoList)))
        break

with open('/data/games.json', 'w') as jsonFile:
    json.dump(gameInfoList, jsonFile, indent=4)
    print("JSON File Written")
