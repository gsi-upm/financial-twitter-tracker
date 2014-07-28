import pymongo
import datetime
import numpy as np

from matplotlib.pyplot import *
from matplotlib.dates import *

sent_service = 'paradigma'

# fromDate = datetime.datetime(2009, 05, 01, 0, 0, 0)
# toDate = datetime.datetime(2010, 03, 31, 0, 0, 0)

fromDate = datetime.datetime(2013, 12, 12, 0, 0, 0)
toDate = datetime.datetime(2014, 03, 13, 0, 0, 0)

mongoClient = pymongo.MongoClient()

db = mongoClient.twitter

date = fromDate
date_plot = []
### TEF
ticker = 'tef_en'
n_tef = []

date = fromDate
while date <= toDate:
	number = 0
	for post in db[ticker].find({'date': date}):
		# print post['date'].isoformat() + '\t' + str(post['price'])
		# price.append(post['price'])
		# sent_tef_pos.append(post[sent_service]['pos'])
		# sent_tef_neg.append(post[sent_service]['neg'])
		number += 1

	n_tef.append(number)
	date_plot.append(date)

	date = date + datetime.timedelta(days=1)

### SAN
ticker = 'san_en'
n_san = []

date = fromDate
while date <= toDate:
	number = 0
	for post in db[ticker].find({'date': date}):
		# print post['date'].isoformat() + '\t' + str(post['price'])
		# price.append(post['price'])
		# sent_san_pos.append(post[sent_service]['pos'])
		# sent_san_neg.append(post[sent_service]['neg'])
		number += 1

	n_san.append(number)

	date = date + datetime.timedelta(days=1)

### IBE
ticker = 'ibe_en'
n_ibe = []

date = fromDate
while date <= toDate:
	number = 0
	for post in db[ticker].find({'date': date}):
		# print post['date'].isoformat() + '\t' + str(post['price'])
		# price.append(post['price'])
		# sent_ibe_pos.append(post[sent_service]['pos'])
		# sent_ibe_neg.append(post[sent_service]['neg'])
		number += 1

	n_ibe.append(number)

	date = date + datetime.timedelta(days=1)

### VOD
ticker = 'vod_en'
n_vod = []
date_plot_vod = []
date = fromDate
while date <= toDate:
	number = 0
	for post in db[ticker].find({'date': date}):
		# print post['date'].isoformat() + '\t' + str(post['price'])
		# price.append(post['price'])
		# sent_vod_pos.append(post[sent_service]['pos'])
		# sent_vod_neg.append(post[sent_service]['neg'])
		number += 1

	n_vod.append(number)
	date_plot_vod.append(date)

	date = date + datetime.timedelta(days=1)

x = [date2num(date) for date in date_plot]
x_vod = [date2num(date) for date in date_plot_vod]

font={'size': 16}
matplotlib.rc('font', **font)

f, axarr = subplots(4, sharex=True)

f.subplots_adjust(left=0.07, bottom=0.06, right=0.94, top=0.97, hspace=0.12)

axarr[0].plot_date(x,n_tef,'b-', label='number per day')
axarr[0].set_ylabel('TEF', fontsize=18)
axarr[0].legend(prop={'size':15}, loc=2)
axarr[1].plot_date(x,n_san,'b-', label='number per day')
axarr[1].set_ylabel('SAN', fontsize=18)
axarr[2].plot_date(x,n_ibe,'b-', label='number per day')
axarr[2].set_ylabel('IBE', fontsize=18)
axarr[3].plot_date(x_vod,n_vod,'b-', label='number per day')
axarr[3].set_ylabel('VOD', fontsize=18)

# print x
# xticks(np.arange(12))
# axarr[2].set_xticks(x)
# axarr[2].set_xticklabels(
#         [date.strftime("%Y-%m-%d") for date in date_plot]
#         )

# f.text(0.5, 0.04, 'Sentiment 140',ha='center', va='center', fontsize=18)

show()