import pymongo
import datetime
import numpy as np

from pylab import plot,show

ticker = 'aapl'
sent_service = 'viralheat'

fromDate = datetime.datetime(2009, 05, 01, 0, 0, 0)
toDate = datetime.datetime(2010, 03, 31, 0, 0, 0)

# fromDate = datetime.datetime(2013, 12, 12, 0, 0, 0)
# toDate = datetime.datetime(2014, 03, 13, 0, 0, 0)

window = 100

mongoClient = pymongo.MongoClient()

db = mongoClient.ftt

date = fromDate
price = []
sentiment = []
while date <= toDate:
	for post in db[ticker].find({'date': date}):
		# print post['date'].isoformat() + '\t' + str(post['price'])
		price.append(post['price'])
		# sentiment.append(post[sent_service]['pos'] - post[sent_service]['neg'])

		sentiment.append(post[sent_service]['neg'])
	date = date + datetime.timedelta(days=1)

# print sentiment
# print len(price)
predicted = []
diff = []
for i in range(len(price) - window - 1):
	price_w = price[i:i+window]
	sentiment_w = sentiment[i:i+window]

	price_tomorrow = price[i+1:i+window+1]

	A = np.array([np.ones(window), price_w, sentiment_w])
	w = np.linalg.lstsq(A.T,price_tomorrow)[0]
	print str(w[0] + w[1]*price_w[window-1] + w[2]*sentiment_w[window-1]) + '\t' + str(price_tomorrow[window-1])
	predicted.append(w[0] + w[1]*price_w[window-1] + w[2]*sentiment_w[window-1])
	diff.append(w[0] + w[1]*price_w[window-1] + w[2]*sentiment_w[window-1] - price[window+i])

predicted.pop()

while (len(predicted) < len(price)):
	predicted.insert(0,0)
predicted.pop()
predicted.insert(0,0)
plot(np.arange(0,len(price)),price,'ro-',np.arange(0,len(price)),predicted,'x-')

suma = 0
for d in diff:
	suma += abs(d)
print suma/len(diff)
# plot(np.arange(0,len(diff)),diff,'r-')
show()