import pymongo
import datetime
import json

tickers = ['tef_es']

mongoclient = pymongo.MongoClient()
db = mongoclient.twitter

for ticker in tickers:

	print ticker.upper()

	col = db[ticker]

	src = open('paradigma/' + ticker + '.txt', 'r')

	line = src.readline()

	json_line = json.loads(line)
	contador = 0
	for key in json_line:
		
		date = json_line[key]['created_at'].split(' ')
		date = date[5] + ' ' + date[1] + ' '  + date[2] + ' '  + date[3].replace(':', ' ')
		# date = datetime.datetime.strptime(date, '%Y %b %d %H %M %S')
		# print date
		# exit()
		tweet = {
			"author": json_line[key]['user']['screen_name'],
			"tweet": json_line[key]['text'],
			"date": datetime.datetime.strptime(date, '%Y %b %d %H %M %S').replace(hour=0,minute=0,second=0),
			"ticker": ticker,
			"sentiment": json_line[key]['new_sentiment']
		}

		col.insert(tweet)

		contador += 1
		if (contador%1000 == 0):
			print contador

	print ticker + ': ' + str(contador)