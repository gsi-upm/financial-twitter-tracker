import pymongo
import datetime
import numpy as np

import math

from pylab import plot,show


mongoClient = pymongo.MongoClient()
db_ftt = mongoClient.ftt
db_vix = mongoClient.vix

# # AAPL 
# tickers = ['aapl', 'amzn', 'goog']
tickers = ['aapl']

fromDate = datetime.datetime(2009, 05, 01, 0, 0, 0)
toDate = datetime.datetime(2010, 03, 31, 0, 0, 0)
sent_service = 'viralheat'


# tickers = ['ibe_en', 'vod_en', 'tef_en', 'san_en']
# fromDate = datetime.datetime(2013, 12, 12, 0, 0, 0)
# toDate = datetime.datetime(2014, 03, 13, 0, 0, 0)


vix_array = []
fear_array = []
date_array = []

date = fromDate
while date <= toDate:

	fear = 0

	for ticker in tickers:
		for post in db_ftt[ticker].find({'date': date}):
			date_array.append(date)
			# print post

			vix = post['vnx']
			fear += post['emotion']['fear']

	vix_array.append(vix)
	fear_array.append(fear)

	db_vix['vix'].update({'date': date}, {'$set': {'vnx': vix}})
	# db_vix['vix'].insert({'date': date, 'vix': vix, 'fear_aapl': fear})

	date = date + datetime.timedelta(days=1)

print len(vix_array)
print len(fear_array)

exit()

vix_today = vix_array[:-1]
vix_tomorrow = vix_array[1:]
fear_today = fear_array[:-1]
date = date[:-1]

window = 20

for i in range(len(vix_today) - window - 1):
	vix_tod = vix_today[i:window+i]
	vix_tom = vix_tomorrow[i:window+i]
	fear_tod = fear_today[i:window+i]

	A = np.array([np.ones(window-1), return_price[:-1], var_x[:-1]])




exit()

tickers = ['aapl', 'amzn', 'goog', 'ibe_es', 'ibe_en', 'san_es', 'san_en', 'tef_en', 'vod_en', 'vod_es'] 


# fromDate = datetime.datetime(2009, 05, 01, 0, 0, 0)
# toDate = datetime.datetime(2010, 03, 31, 0, 0, 0)
# sent_service = 'viralheat'

# fromDate = datetime.datetime(2013, 12, 12, 0, 0, 0)
# toDate = datetime.datetime(2014, 03, 13, 0, 0, 0)
# sent_service = 'paradigma'


for ticker in tickers:

	if ticker == 'goog' or ticker == 'amzn' or ticker == 'aapl':
		fromDate = datetime.datetime(2009, 05, 01, 0, 0, 0)
		toDate = datetime.datetime(2010, 03, 31, 0, 0, 0)
		sent_service = 'viralheat'
	else:
		fromDate = datetime.datetime(2013, 12, 12, 0, 0, 0)
		toDate = datetime.datetime(2014, 03, 13, 0, 0, 0)
		sent_service = 'paradigma'


	window = 20

	mongoClient = pymongo.MongoClient()

	db = mongoClient.ftt

	date = fromDate
	dates = []
	while date <= toDate:
		for post in db[ticker].find({'date': date}):
			dates.append(date)

		date = date + datetime.timedelta(days=1)

	print len(dates)

	for i in range(len(dates) - window - 1):
		dates_period = dates[i:window+i]

		price = []
		return_price = []
		sentiment_p = []
		sentiment_n = []
		sentiment_d = []
		sentiment_bind = []
		sentiment_tis = []
		sentiment_rtis = []
		emotion_a = []
		emotion_d = []
		emotion_f = []
		emotion_h = []
		emotion_sa = []
		emotion_su = []
		vix = []

		for date in dates_period:
			for post in db[ticker].find({'date': date}):
				# print post
				# print '\n'
				price.append(post['price'])
				return_price.append(post['return'])
				sentiment_p.append(post[sent_service]['pos'])
				sentiment_n.append(post[sent_service]['neg'])
				sentiment_d.append(post[sent_service]['pos'] - post[sent_service]['neg'])
				sentiment_bind.append(post[sent_service]['bind'])
				sentiment_tis.append(post[sent_service]['TIS'])
				sentiment_rtis.append(post[sent_service]['RTIS'])
				emotion_a.append(post['emotion']['anger'])
				emotion_d.append(post['emotion']['disgust'])
				emotion_f.append(post['emotion']['fear'])
				emotion_h.append(post['emotion']['happiness'])
				emotion_sa.append(post['emotion']['sadness'])
				emotion_su.append(post['emotion']['surprise'])
				vix.append(post['vix'])

		price_tomorrow = price[1:]
		return_tomorrow = return_price[1:]

		# # M1

		# var_x = sentiment_tis

		# # A = np.array([np.ones(window-1), return_price[:-1], var_x[:-1]])
		# A = np.array([np.ones(window-1), return_price[:-1]])
		# # w = np.linalg.lstsq(A.T, price_tomorrow)[0]
		# w = np.linalg.lstsq(A.T, return_tomorrow)[0]

		# # prediction = w[0] + w[1]*price[-1] + w[2]*var_x[-1]
		# prediction = w[0] + w[1]*return_price[-1]

		# # print prediction
		# print i

		# for post in mongoClient.pred[ticker].find({'date': dates[window+i]}):
		# 	identifier = post['_id']
		# 	mongoClient.pred[ticker].update({'_id': identifier}, {'$set': {'prediction_M1': prediction}})