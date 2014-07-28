import downloadData
import pymongo
import datetime
import math

fromDate = datetime.date(2009, 05, 01)
toDate = datetime.date(2010, 03, 31)

tickers = ['amzn']

mongoClient = pymongo.MongoClient()

db_twitter = mongoClient.twitter
db_ftt = mongoClient.ftt

for ticker in tickers:
	stock_data = downloadData.getData(ticker, fromDate, toDate)

	price_yesterday = 1.0
	TIS_viralheat_yesterday = 1

	for key in stock_data.keys():
		
		document = {}
		
		date = datetime.datetime(key.year, key.month, key.day, 0, 0, 0)

		document['price'] = stock_data[key]
		# price_yesterday = stock_data[key]  PONER AL FINAL

		_viralheat = {
			'pos': 0,
			'neg': 0,
			'bind': 0,
			'TIS': 0,
			'RTIS': 0
		}


		# Ver si hay sentimiento de ambos en un dia
		sent_in_viralheat = False

		# Agregar sentimiento por fuente
		for post in db_twitter[ticker].find({'date': date}):

			if 'sentiment_viralheat' in post:

				sent_in_viralheat = True
				if post['sentiment_viralheat'] > 0.5:
					_viralheat['pos'] += 1
				elif post['sentiment_viralheat'] < 0.5:
					_viralheat['neg'] += 1


		_viralheat['bind'] = math.log( (1.0+_viralheat['pos']) / (1.0+_viralheat['neg']) )
		_viralheat['TIS'] = (_viralheat['pos']+1.0) / (_viralheat['pos'] + _viralheat['neg'] + 1.0)
		_viralheat['RTIS'] = _viralheat['TIS'] / TIS_viralheat_yesterday
		TIS_viralheat_yesterday = _viralheat['TIS']

		document['viralheat'] = _viralheat

		# document['return'] = (stock_data[key] - price_yesterday) / (price_yesterday)
		# document['date'] = datetime.datetime(key.year, key.month, key.day, 0, 0, 0)
					
		price_yesterday = stock_data[key]

		db_ftt[ticker].update({'date': date}, {'$set': {'viralheat': _viralheat}})