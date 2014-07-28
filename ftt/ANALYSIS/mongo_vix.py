import pymongo
import datetime
import downloadData

client = pymongo.MongoClient()

tickers = ['aapl', 'goog', 'amzn', 'ibe_en', 'ibe_es', 'san_en', 'san_es', 'vod_en', 'vod_es', 'tef_en']

for ticker in tickers:
	print ticker
	if (ticker == 'aapl') or (ticker == 'goog') or (ticker == 'amzn'):
		fromDate = datetime.datetime(2009, 05, 01)
		toDate = datetime.datetime(2010, 03, 31)
	else:
		fromDate = datetime.datetime(2013, 12, 12)
		toDate = datetime.datetime(2014, 03, 13)

	vix_col = downloadData.getData("%5EVXN", fromDate, toDate)
	# print vix_col
	db = client.ftt

	date = fromDate

	while (date <= toDate):
		post = db[ticker].find({'date': date})

		if not datetime.date(date.year, date.month, date.day) in vix_col.keys():
			print 'not_date'
			date = date + datetime.timedelta(days=1)
			continue

		if post.count() == 0:
			date = date + datetime.timedelta(days=1)
			continue
		else:
			post = post[0]
		print post['_id']
		post_id = post['_id']

		db[ticker].update({'_id': post_id}, {'$set': {'vnx': vix_col[datetime.date(date.year, date.month, date.day)]}})

		date = date + datetime.timedelta(days=1)

	# for key in vix_col:
	# 	key = datetime.datetime(key.year, key.month, key.day)
	# 	docs = db[ticker].find({'date': key})
	# 	# print docs[0]
	# 	for doc in docs:
	# 		print doc
	# 	# db[ticker].update({'_id': id_doc}, {'vix': vix_col[key]})

