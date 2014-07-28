import pymongo
import datetime
import numpy as np

from matplotlib.pyplot import *
from matplotlib.dates import *

sent_service = 'davies'

fromDate = datetime.datetime(2009, 05, 01, 0, 0, 0)
toDate = datetime.datetime(2010, 03, 31, 0, 0, 0)

# fromDate = datetime.datetime(2013, 12, 12, 0, 0, 0)
# toDate = datetime.datetime(2014, 03, 13, 0, 0, 0)

mongoClient = pymongo.MongoClient()

db = mongoClient.ftt

date = fromDate
date_plot = []
### AAPL
ticker = 'aapl'
sent_aapl_pos = []
sent_aapl_neg = []

date = fromDate
while date <= toDate:
	for post in db[ticker].find({'date': date}):
		# print post['date'].isoformat() + '\t' + str(post['price'])
		# price.append(post['price'])
		sent_aapl_pos.append(post[sent_service]['pos'])
		sent_aapl_neg.append(post[sent_service]['neg'])
		date_plot.append(date)

	date = date + datetime.timedelta(days=1)

### GOOG
ticker = 'goog'
sent_goog_pos = []
sent_goog_neg = []

date = fromDate
while date <= toDate:
	for post in db[ticker].find({'date': date}):
		# print post['date'].isoformat() + '\t' + str(post['price'])
		# price.append(post['price'])
		sent_goog_pos.append(post[sent_service]['pos'])
		sent_goog_neg.append(post[sent_service]['neg'])

	date = date + datetime.timedelta(days=1)

### AMZN
ticker = 'amzn'
sent_amzn_pos = []
sent_amzn_neg = []

date = fromDate
while date <= toDate:
	for post in db[ticker].find({'date': date}):
		# print post['date'].isoformat() + '\t' + str(post['price'])
		# price.append(post['price'])
		sent_amzn_pos.append(post[sent_service]['pos'])
		sent_amzn_neg.append(post[sent_service]['neg'])

	date = date + datetime.timedelta(days=1)

x = [date2num(date) for date in date_plot]

font={'size': 16}
matplotlib.rc('font', **font)

f, axarr = subplots(3, sharex=True)

f.subplots_adjust(left=0.07, bottom=0.06, right=0.97, top=0.97, hspace=0.12)

axarr[0].plot_date(x,sent_aapl_pos,'g-', label='positivos')
axarr[0].plot_date(x,sent_aapl_neg,'r-', label='negativos')
axarr[0].set_ylabel('AAPL', fontsize=18)
axarr[1].plot_date(x,sent_amzn_pos,'g-', label='positivos')
axarr[1].plot_date(x,sent_amzn_neg,'r-', label='negativos')
axarr[1].set_ylabel('AMZN', fontsize=18)
axarr[2].plot_date(x,sent_goog_pos,'g-', label='positivos')
axarr[2].plot_date(x,sent_goog_neg,'r-', label='negativos')
axarr[2].set_ylabel('GOOG', fontsize=18)

# print x
# xticks(np.arange(12))
# axarr[2].set_xticks(x)
# axarr[2].set_xticklabels(
#         [date.strftime("%Y-%m-%d") for date in date_plot]
#         )

# f.text(0.5, 0.04, 'Sentiment 140',ha='center', va='center', fontsize=18)

show()