import downloadData
import pymongo
import datetime
import math

# fromDate = datetime.date(2013, 12, 12)
# toDate = datetime.date(2014, 03, 13)

# tickers = ['ibe_en', 'ibe_es', 'vod_en', 'vod_es', 'san_en', 'san_es', 'tef_en']

fromDate = datetime.date(2009, 05, 01)
toDate = datetime.date(2010, 03, 31)

tickers = ['aapl', 'goog', 'amzn']

mongoClient = pymongo.MongoClient()

db_twitter = mongoClient.twitter
db_ftt = mongoClient.ftt

for ticker in tickers:
	print ticker.upper()

	stock_data = downloadData.getData(ticker, fromDate, toDate)

	for key in stock_data.keys():
		
		document = {}
		
		date = datetime.datetime(key.year, key.month, key.day, 0, 0, 0)

		emotion = {
			'anger': 0,
			'happiness': 0,
			'fear': 0,
			'disgust': 0,
			'sadness': 0,
			'surprise': 0
		}

		# Agregar sentimiento por fuente
		for post in db_twitter[ticker].find({'date': date}):
			if 'emotion' in post:
				emotion['anger'] += post['emotion']['anger']
				emotion['happiness'] += post['emotion']['happiness']
				emotion['fear'] += post['emotion']['fear']
				emotion['disgust'] += post['emotion']['disgust']
				emotion['sadness'] += post['emotion']['sadness']
				emotion['surprise'] += post['emotion']['surprise']

		date = datetime.datetime(key.year, key.month, key.day, 0, 0, 0)
		db_ftt[ticker].update({'date': date}, {'$set': {'emotion': emotion}})

	 