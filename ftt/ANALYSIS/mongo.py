import pymongo
import os
import datetime

client = pymongo.MongoClient()

db = client.twitter

tickers = ['aapl', 'goog', 'amzn']

# for ticker in tickers:
	
# 	col = db[ticker]
# 	contador = 0
# 	for document in col.find({'sentiment_140': {'$exists': 'true'}}):
# 		contador +=1
# 		# print document['sentiment_140']

# 	print contador


# ### Insert sentiment from 140

# for ticker in tickers:

# 	col = db[ticker]

# 	p_src = os.path.join(os.path.dirname(__file__), 'sentiment_140/' + ticker)
# 	src = open(p_src, 'r')

# 	contador = 0

# 	for line in src:
# 		line = line.split('\t')

# 		id_tweet = line[2]
# 		sentiment_140 = float(line[5])

# 		col.update({"id": id_tweet}, {"$set": {"sentiment_140": sentiment_140}})

# 		contador += 1
# 		if (contador%100 == 0):
# 			print contador


# ### Insert sentiment from davies

# for ticker in tickers:

# 	col = db[ticker]

# 	p_src = os.path.join(os.path.dirname(__file__), 'sentiment_davies/' + ticker)
# 	src = open(p_src, 'r')

# 	contador = 0

# 	for line in src:
# 		line = line.split('\t')

# 		id_tweet = line[2]
# 		sentiment_davies = float(line[5])

# 		col.update({"id": id_tweet}, {"$set": {"sentiment_davies": sentiment_davies}})

# 		contador += 1
# 		if (contador%100 == 0):
# 			print contador




# ### Insert tweets in mongo

# for ticker in tickers:

# 	col = db[ticker]

# 	p_src = os.path.join(os.path.dirname(__file__), 'twitter/' + ticker)
# 	src = open(p_src, 'r')

# 	contador = 0

# 	for line in src:
# 		line = line.split('\t')

# 		tweet = {
# 			"author": line[4][:-1],
# 			"tweet": line[3],
# 			"id": line[2],
# 			"date": datetime.datetime.strptime(line[0], '%Y%m%d%H%M%S').replace(hour=0,minute=0,second=0),
# 			"ticker": line[1]
# 		}

# 		col.insert(tweet)

# 		contador += 1
# 		if (contador%100 == 0):
# 			print contador