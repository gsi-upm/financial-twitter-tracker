import downloadData
import pymongo
import datetime
import math

# fromDate = datetime.date(2009, 05, 01)
# toDate = datetime.date(2010, 03, 31)

# tickers = ['aapl', 'goog', 'amzn']

fromDate = datetime.date(2013, 12, 12)
toDate = datetime.date(2014, 03, 13)

tickers = ['ibe_en', 'ibe_es', 'tef_en', 'san_en', 'san_es', 'vod_en', 'vod_es']

mongoClient = pymongo.MongoClient()

db_twitter = mongoClient.twitter
db_ftt = mongoClient.ftt

for ticker in tickers:

	stock_data = downloadData.getData(ticker, fromDate, toDate)

	price_yesterday = 1.0
	TIS_paradigma_yesterday = 1

	for key in stock_data.keys():
		
		document = {}
		
		date = datetime.datetime(key.year, key.month, key.day, 0, 0, 0)

		document['price'] = stock_data[key]
		# price_yesterday = stock_data[key]  PONER AL FINAL

		paradigma = {
			'pos': 0,
			'neg': 0,
			'bind': 0,
			'TIS': 0,
			'RTIS': 0
		}

		# Ver si hay sentimiento de ambos en un dia
		sent_in_paradigma = False

		# Agregar sentimiento por fuente
		for post in db_twitter[ticker].find({'date': date}):
			if 'sentiment' in post:
				sent_in_paradigma = True
				sentiment_paradigma = post['sentiment']
				if sentiment_paradigma > 0:
					paradigma['pos'] += 1
				elif sentiment_paradigma < 0:
					paradigma['neg'] += 1


		# Calcular indicadores si existe fuente ese dia
		if sent_in_paradigma:
			paradigma['bind'] = math.log( (1.0+paradigma['pos']) / (1.0+paradigma['neg']) )
			paradigma['TIS'] = (paradigma['pos']+1.0) / (paradigma['pos'] + paradigma['neg'] + 1.0)
			paradigma['RTIS'] = paradigma['TIS'] / TIS_paradigma_yesterday
			# Actualizamos TIS
			TIS_paradigma_yesterday = paradigma['TIS']
		else:
			# paradigma = {}
			# Actualizamos TIS, que seria 1 por que hay cero positivos y cero negativos
			paradigma['pos'] = 0
			paradigma['neg'] = 0
			paradigma['bind'] = 0
			paradigma['TIS'] = 1
			paradigma['RTIS'] = paradigma['TIS'] / TIS_paradigma_yesterday
			TIS_paradigma_yesterday = paradigma['TIS']


		document['paradigma'] = paradigma

		document['return'] = (stock_data[key] - price_yesterday) / (price_yesterday)
		document['date'] = datetime.datetime(key.year, key.month, key.day, 0, 0, 0)

		# Actualizamos precio
		price_yesterday = stock_data[key]

		# print document
		# exit()
		db_ftt[ticker].insert(document)

	 