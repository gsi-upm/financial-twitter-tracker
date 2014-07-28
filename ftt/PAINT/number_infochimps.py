import pymongo
import datetime
import numpy as np

from matplotlib.pyplot import *
from matplotlib.dates import *

sent_service = 'viralheat'

fromDate = datetime.datetime(2009, 05, 01, 0, 0, 0)
toDate = datetime.datetime(2010, 03, 31, 0, 0, 0)

# fromDate = datetime.datetime(2013, 12, 12, 0, 0, 0)
# toDate = datetime.datetime(2014, 03, 13, 0, 0, 0)

mongoClient = pymongo.MongoClient()

db = mongoClient.twitter

date = fromDate
### AAPL
ticker = 'aapl'
n_aapl = []
date_plot_aapl = []

date = fromDate
while date <= toDate:
	number = 0
	k = False
	for post in db[ticker].find({'date': date}):
		# print post['date'].isoformat() + '\t' + str(post['price'])
		# price.append(post['price'])
		# sent_tef_pos.append(post[sent_service]['pos'])
		# sent_tef_neg.append(post[sent_service]['neg'])
		number += 1
		if not k:
			date_plot_aapl.append(date)
			k = True

	if k:
		n_aapl.append(number)
	# date_plot.append(date)

	date = date + datetime.timedelta(days=1)

### AMZN
ticker = 'amzn'
n_amzn = []
date_plot_amzn = []

date = fromDate
while date <= toDate:
	number = 0
	k = False
	for post in db[ticker].find({'date': date}):
		# print post['date'].isoformat() + '\t' + str(post['price'])
		# price.append(post['price'])
		# sent_san_pos.append(post[sent_service]['pos'])
		# sent_san_neg.append(post[sent_service]['neg'])
		number += 1
		if not k:
			date_plot_amzn.append(date)
			k = True

	if k:
		n_amzn.append(number)

	date = date + datetime.timedelta(days=1)

### GOOG
ticker = 'goog'
n_goog = []
date_plot_goog = []

date = fromDate
while date <= toDate:
	number = 0
	k = False
	for post in db[ticker].find({'date': date}):
		# print post['date'].isoformat() + '\t' + str(post['price'])
		# price.append(post['price'])
		# sent_ibe_pos.append(post[sent_service]['pos'])
		# sent_ibe_neg.append(post[sent_service]['neg'])
		number += 1
		if not k:
			date_plot_goog.append(date)
			k = True

	if k:
		n_goog.append(number)

	date = date + datetime.timedelta(days=1)


print len(date_plot_aapl)
print len(n_aapl)
print len(date_plot_amzn)
print len(n_amzn)
print len(date_plot_goog)
print len(n_goog)
x_aapl = [date2num(date) for date in date_plot_aapl]
x_amzn = [date2num(date) for date in date_plot_amzn]
x_goog = [date2num(date) for date in date_plot_goog]

font={'size': 16}
matplotlib.rc('font', **font)

f, axarr = subplots(3, sharex=True)

f.subplots_adjust(left=0.07, bottom=0.06, right=0.94, top=0.97, hspace=0.12)

axarr[0].plot_date(x_aapl,n_aapl,'b-', label='number per day')
axarr[0].set_ylabel('AAPL', fontsize=18)
axarr[0].legend(prop={'size':15}, loc=2)
axarr[1].plot_date(x_amzn,n_amzn,'b-', label='number per day')
axarr[1].set_ylabel('AMZN', fontsize=18)
axarr[2].plot_date(x_goog,n_goog,'b-', label='number per day')
axarr[2].set_ylabel('GOOG', fontsize=18)

# print x
# xticks(np.arange(12))
# axarr[2].set_xticks(x)
# axarr[2].set_xticklabels(
#         [date.strftime("%Y-%m-%d") for date in date_plot]
#         )

# f.text(0.5, 0.04, 'Sentiment 140',ha='center', va='center', fontsize=18)

show()