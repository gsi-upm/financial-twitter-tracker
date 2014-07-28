import pymongo
import datetime
import numpy as np

import math

from pylab import plot,show

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

		# # M2
		# for j in range(len(sentiment_tis)):
		# 	sentiment_tis[j] = math.log(sentiment_tis[j])
		
		# var_x = sentiment_tis

		# A = np.array([np.ones(window-1), return_price[:-1], var_x[:-1]])
		# w = np.linalg.lstsq(A.T, return_tomorrow)[0]

		# prediction = w[0] + w[1]*return_price[-1] + w[2]*var_x[-1]

		# # print prediction
		# print i

		# for post in mongoClient.pred[ticker].find({'date': dates[window+i]}):
		# 	identifier = post['_id']
		# 	mongoClient.pred[ticker].update({'_id': identifier}, {'$set': {'prediction_M2': prediction}})


		# # M3
		# for j in range(len(sentiment_rtis)):
		# 	sentiment_rtis[j] = math.log(sentiment_rtis[j])
		
		# var_x = sentiment_rtis

		# A = np.array([np.ones(window-1), return_price[:-1], var_x[:-1]])
		# w = np.linalg.lstsq(A.T, return_tomorrow)[0]

		# prediction = w[0] + w[1]*return_price[-1] + w[2]*var_x[-1]

		# # print prediction
		# print i

		# for post in mongoClient.pred[ticker].find({'date': dates[window+i]}):
		# 	identifier = post['_id']
		# 	mongoClient.pred[ticker].update({'_id': identifier}, {'$set': {'prediction_M3': prediction}})


		# # M4	
		# var_x = sentiment_bind

		# A = np.array([np.ones(window-1), var_x[:-1]])
		# w = np.linalg.lstsq(A.T, return_tomorrow)[0]

		# prediction = w[0] + w[1]*var_x[-1]

		# # print prediction
		# print i

		# for post in mongoClient.pred[ticker].find({'date': dates[window+i]}):
		# 	identifier = post['_id']
		# 	mongoClient.pred[ticker].update({'_id': identifier}, {'$set': {'prediction_M4': prediction}})


		# # M5
		# for j in range(len(sentiment_tis)):
		# 	sentiment_tis[j] = math.log(sentiment_tis[j])
		
		# var_x = sentiment_tis

		# A = np.array([np.ones(window-1), var_x[:-1]])
		# w = np.linalg.lstsq(A.T, return_tomorrow)[0]

		# prediction = w[0] + w[1]*var_x[-1]

		# # print prediction
		# print i

		# for post in mongoClient.pred[ticker].find({'date': dates[window+i]}):
		# 	identifier = post['_id']
		# 	mongoClient.pred[ticker].update({'_id': identifier}, {'$set': {'prediction_M5': prediction}})


		# # emotion base

		# var_x = emotion_a

		# # A = np.array([np.ones(window-1), return_price[:-1], var_x[:-1]])
		# A = np.array([np.ones(window-1), price[:-1]])
		# # w = np.linalg.lstsq(A.T, price_tomorrow)[0]
		# w = np.linalg.lstsq(A.T, price_tomorrow)[0]

		# # prediction = w[0] + w[1]*price[-1] + w[2]*var_x[-1]
		# prediction = w[0] + w[1]*price[-1]

		# # print prediction
		# print i

		# for post in mongoClient.pred[ticker].find({'date': dates[window+i]}):
		# 	identifier = post['_id']
		# 	mongoClient.pred[ticker].update({'_id': identifier}, {'$set': {'prediction_emotion_base': prediction}})



		# # emotion anger
		
		# var_x = emotion_a

		# A = np.array([np.ones(window-1), price[:-1], var_x[:-1]])
		# w = np.linalg.lstsq(A.T, price_tomorrow)[0]

		# prediction = w[0] + w[1]*price[-1] + w[2]*var_x[-1]

		# # print prediction
		# print i

		# for post in mongoClient.pred[ticker].find({'date': dates[window+i]}):
		# 	identifier = post['_id']
		# 	mongoClient.pred[ticker].update({'_id': identifier}, {'$set': {'prediction_emotion_anger': prediction}})


		# # emotion disgust
		
		# var_x = emotion_d

		# A = np.array([np.ones(window-1), price[:-1], var_x[:-1]])
		# w = np.linalg.lstsq(A.T, price_tomorrow)[0]

		# prediction = w[0] + w[1]*price[-1] + w[2]*var_x[-1]

		# # print prediction
		# print i

		# for post in mongoClient.pred[ticker].find({'date': dates[window+i]}):
		# 	identifier = post['_id']
		# 	mongoClient.pred[ticker].update({'_id': identifier}, {'$set': {'prediction_emotion_disgust': prediction}})


		# # emotion fear
		
		# var_x = emotion_f

		# A = np.array([np.ones(window-1), price[:-1], var_x[:-1]])
		# w = np.linalg.lstsq(A.T, price_tomorrow)[0]

		# prediction = w[0] + w[1]*price[-1] + w[2]*var_x[-1]

		# # print prediction
		# print i

		# for post in mongoClient.pred[ticker].find({'date': dates[window+i]}):
		# 	identifier = post['_id']
		# 	mongoClient.pred[ticker].update({'_id': identifier}, {'$set': {'prediction_emotion_fear': prediction}})
		

		# # emotion happiness
		
		# var_x = emotion_h

		# A = np.array([np.ones(window-1), price[:-1], var_x[:-1]])
		# w = np.linalg.lstsq(A.T, price_tomorrow)[0]

		# prediction = w[0] + w[1]*price[-1] + w[2]*var_x[-1]

		# # print prediction
		# print i

		# for post in mongoClient.pred[ticker].find({'date': dates[window+i]}):
		# 	identifier = post['_id']
		# 	mongoClient.pred[ticker].update({'_id': identifier}, {'$set': {'prediction_emotion_happiness': prediction}})


		# # emotion sadness
		
		# var_x = emotion_sa

		# A = np.array([np.ones(window-1), price[:-1], var_x[:-1]])
		# w = np.linalg.lstsq(A.T, price_tomorrow)[0]

		# prediction = w[0] + w[1]*price[-1] + w[2]*var_x[-1]

		# # print prediction
		# print i

		# for post in mongoClient.pred[ticker].find({'date': dates[window+i]}):
		# 	identifier = post['_id']
		# 	mongoClient.pred[ticker].update({'_id': identifier}, {'$set': {'prediction_emotion_sadness': prediction}})


		# # emotion surprise
		
		# var_x = emotion_su

		# A = np.array([np.ones(window-1), price[:-1], var_x[:-1]])
		# w = np.linalg.lstsq(A.T, price_tomorrow)[0]

		# prediction = w[0] + w[1]*price[-1] + w[2]*var_x[-1]

		# # print prediction
		# print i

		# for post in mongoClient.pred[ticker].find({'date': dates[window+i]}):
		# 	identifier = post['_id']
		# 	mongoClient.pred[ticker].update({'_id': identifier}, {'$set': {'prediction_emotion_surprise': prediction}})




	# # print sentiment
	# # print len(price)
	# predicted = []
	# diff = []
	# for i in range(len(price) - window - 1):
	# 	price_w = price[i:i+window]
	# 	sentiment_w = sentiment[i:i+window]

	# 	price_tomorrow = price[i+1:i+window+1]

	# 	A = np.array([np.ones(window), price_w, sentiment_w])
	# 	w = np.linalg.lstsq(A.T,price_tomorrow)[0]
	# 	print str(w[0] + w[1]*price_w[window-1] + w[2]*sentiment_w[window-1]) + '\t' + str(price_tomorrow[window-1])
	# 	predicted.append(w[0] + w[1]*price_w[window-1] + w[2]*sentiment_w[window-1])
	# 	diff.append(w[0] + w[1]*price_w[window-1] + w[2]*sentiment_w[window-1] - price[window+i])

	# predicted.pop()

	# while (len(predicted) < len(price)):
	# 	predicted.insert(0,0)
	# predicted.pop()
	# predicted.insert(0,0)
	# plot(np.arange(0,len(price)),price,'ro-',np.arange(0,len(price)),predicted,'x-')

	# suma = 0
	# for d in diff:
	# 	suma += abs(d)
	# print suma/len(diff)
	# # plot(np.arange(0,len(diff)),diff,'r-')
	# show()