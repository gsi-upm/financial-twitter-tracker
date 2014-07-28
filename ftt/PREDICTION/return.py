import pymongo
import datetime
import numpy as np

from pylab import plot,show

ticker = 'vod_es'
sent_service = 'paradigma'

# fromDate = datetime.datetime(2009, 05, 01, 0, 0, 0)
# toDate = datetime.datetime(2010, 03, 31, 0, 0, 0)

fromDate = datetime.datetime(2013, 12, 12, 0, 0, 0)
toDate = datetime.datetime(2014, 03, 13, 0, 0, 0)

mongoClient = pymongo.MongoClient()
db = mongoClient.ftt

date = fromDate
inicial = 1
while date <= toDate:
	for post in db[ticker].find({'date': date}):
		# print post['date'].isoformat() + '\t' + str(post['price'])
		final = post['price']
		# sentiment.append(post[sent_service]['pos'] - post[sent_service]['neg'])

	return_price = (final-inicial)/inicial
	inicial = final

	print return_price
	db[ticker].update({'date': date}, {'$set': {'return': return_price}})

	date = date + datetime.timedelta(days=1)
