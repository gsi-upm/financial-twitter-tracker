import pymongo
import datetime
import numpy as np

import math

from pylab import plot,show


mongoClient = pymongo.MongoClient()
db_vix = mongoClient.vix

window = 20

fromDate = datetime.datetime(2009, 05, 01, 0, 0, 0)
toDate = datetime.datetime(2010, 03, 31, 0, 0, 0)

date = fromDate
dates = []
while date <= toDate:
	for post in db_vix['vix'].find({'date': date}):
		dates.append(date)

	date = date + datetime.timedelta(days=1)

# print len(dates)

for i in range(len(dates) - window - 1):
	
	dates_period = dates[i:window+i]

	vnx = []
	fear_aapl = []
	fear_ip = []


	for date in dates_period:
		for post in db_vix.vix.find({'date': date}):
			vnx.append(post['vnx'])
			fear_aapl.append(post['fear_aapl'])
			fear_ip.append(post['fear_ip'])

	vnx_tomorrow = vnx[1:]

	# # VIX BASE

	# # A = np.array([np.ones(window-1), return_price[:-1], var_x[:-1]])
	# A = np.array([np.ones(window-1), vnx[:-1]])
	# # w = np.linalg.lstsq(A.T, price_tomorrow)[0]
	# w = np.linalg.lstsq(A.T, vnx_tomorrow)[0]

	# # prediction = w[0] + w[1]*price[-1] + w[2]*var_x[-1]
	# prediction = w[0] + w[1]*vnx[-1]


	# # VIX AAPL

	# var_x = fear_aapl

	# A = np.array([np.ones(window-1), vnx[:-1], var_x[:-1]])
	# # A = np.array([np.ones(window-1), vix[:-1]])
	# # w = np.linalg.lstsq(A.T, price_tomorrow)[0]
	# w = np.linalg.lstsq(A.T, vnx_tomorrow)[0]

	# prediction = w[0] + w[1]*vnx[-1] + w[2]*var_x[-1]


	# VIX BASE

	var_x = fear_ip

	A = np.array([np.ones(window-1), vnx[:-1], var_x[:-1]])
	# A = np.array([np.ones(window-1), vix[:-1]])
	# w = np.linalg.lstsq(A.T, price_tomorrow)[0]
	w = np.linalg.lstsq(A.T, vnx_tomorrow)[0]

	prediction = w[0] + w[1]*vnx[-1] + w[2]*var_x[-1]



	for post in mongoClient.vix['vix'].find({'date': dates[window+i]}):
		identifier = post['_id']
		mongoClient.vix['vix'].update({'_id': identifier}, {'$set': {'vnx_p_ip': prediction}})

