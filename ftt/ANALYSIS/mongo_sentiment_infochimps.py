import downloadData
import pymongo
import datetime
import math

fromDate = datetime.date(2009, 05, 01)
toDate = datetime.date(2010, 03, 31)

tickers = ['aapl', 'goog', 'amzn']

mongoClient = pymongo.MongoClient()

db_twitter = mongoClient.twitter
db_ftt = mongoClient.ftt

for ticker in tickers:
	stock_data = downloadData.getData(ticker, fromDate, toDate)

	price_yesterday = 1.0
	TIS_140_yesterday = 1
	TIS_davies_yesterday = 1	

	for key in stock_data.keys():
		
		document = {}
		
		date = datetime.datetime(key.year, key.month, key.day, 0, 0, 0)

		document['price'] = stock_data[key]
		# price_yesterday = stock_data[key]  PONER AL FINAL

		_140 = {
			'pos': 0,
			'neg': 0,
			'bind': 0,
			'TIS': 0,
			'RTIS': 0
		}

		_davies = {
			'pos': 0,
			'neg': 0,
			'bind': 0,
			'TIS': 0,
			'RTIS': 0
		}

		# Ver si hay sentimiento de ambos en un dia
		sent_in_140 = False
		sent_in_davies = False

		# Agregar sentimiento por fuente
		for post in db_twitter[ticker].find({'date': date}):

			if 'sentiment_140' in post:

				sent_in_140 = True
				if post['sentiment_140'] > 0.5:
					_140['pos'] += 1
				elif post['sentiment_140'] < 0.5:
					_140['neg'] += 1

			if 'sentiment_davies' in post:

				sent_in_davies = True
				if post['sentiment_davies'] > 0.5:
					_davies['pos'] += 1
				elif post['sentiment_davies'] < 0.5:
					_davies['neg'] += 1

		_140['bind'] = math.log( (1.0+_140['pos']) / (1.0+_140['neg']) )
		_140['TIS'] = (_140['pos']+1.0) / (_140['pos'] + _140['neg'] + 1.0)
		_140['RTIS'] = _140['TIS'] / TIS_140_yesterday
		TIS_140_yesterday = _140['TIS']

		_davies['bind'] = math.log( (1.0+_davies['pos']) / (1.0+_davies['neg']) )
		_davies['TIS'] = (_davies['pos']+1.0) / (_davies['pos'] + _davies['neg'] + 1.0)
		_davies['RTIS'] = _davies['TIS'] / TIS_davies_yesterday
		TIS_davies_yesterday = _davies['TIS']

		document['140'] = _140
		document['davies'] = _davies

		document['return'] = (stock_data[key] - price_yesterday) / (price_yesterday)
		document['date'] = datetime.datetime(key.year, key.month, key.day, 0, 0, 0)
					
		price_yesterday = stock_data[key]

		db_ftt[ticker].insert(document)