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

db = mongoClient.ftt

date = fromDate
date_plot = []
### TEF
ticker = 'tef_en'
sent_tef_pos = []
sent_tef_neg = []

date = fromDate
while date <= toDate:
	for post in db[ticker].find({'date': date}):
		# print post['date'].isoformat() + '\t' + str(post['price'])
		# price.append(post['price'])
		sent_tef_pos.append(post[sent_service]['pos'])
		sent_tef_neg.append(post[sent_service]['neg'])
		date_plot.append(date)

	date = date + datetime.timedelta(days=1)

### SAN
ticker = 'san_en'
sent_san_pos = []
sent_san_neg = []

date = fromDate
while date <= toDate:
	for post in db[ticker].find({'date': date}):
		# print post['date'].isoformat() + '\t' + str(post['price'])
		# price.append(post['price'])
		sent_san_pos.append(post[sent_service]['pos'])
		sent_san_neg.append(post[sent_service]['neg'])

	date = date + datetime.timedelta(days=1)

### IBE
ticker = 'ibe_en'
sent_ibe_pos = []
sent_ibe_neg = []

date = fromDate
while date <= toDate:
	for post in db[ticker].find({'date': date}):
		# print post['date'].isoformat() + '\t' + str(post['price'])
		# price.append(post['price'])
		sent_ibe_pos.append(post[sent_service]['pos'])
		sent_ibe_neg.append(post[sent_service]['neg'])

	date = date + datetime.timedelta(days=1)

### VOD
ticker = 'vod_en'
sent_vod_pos = []
sent_vod_neg = []
date_plot_vod = []
date = fromDate
while date <= toDate:
	for post in db[ticker].find({'date': date}):
		# print post['date'].isoformat() + '\t' + str(post['price'])
		# price.append(post['price'])
		sent_vod_pos.append(post[sent_service]['pos'])
		sent_vod_neg.append(post[sent_service]['neg'])
		date_plot_vod.append(date)

	date = date + datetime.timedelta(days=1)

x = [date2num(date) for date in date_plot]
x_vod = [date2num(date) for date in date_plot_vod]

font={'size': 16}
matplotlib.rc('font', **font)

f, axarr = subplots(4, sharex=True)

f.subplots_adjust(left=0.07, bottom=0.06, right=0.94, top=0.97, hspace=0.12)

axarr[0].plot_date(x,sent_tef_pos,'g-', label='positivos')
axarr[0].plot_date(x,sent_tef_neg,'r-', label='negativos')
axarr[0].set_ylabel('TEF', fontsize=18)
axarr[0].legend(prop={'size':15}, loc=2)
axarr[1].plot_date(x,sent_san_pos,'g-', label='positivos')
axarr[1].plot_date(x,sent_san_neg,'r-', label='negativos')
axarr[1].set_ylabel('SAN', fontsize=18)
axarr[2].plot_date(x,sent_ibe_pos,'g-', label='positivos')
axarr[2].plot_date(x,sent_ibe_neg,'r-', label='negativos')
axarr[2].set_ylabel('IBE', fontsize=18)
axarr[3].plot_date(x_vod,sent_vod_pos,'g-', label='positivos')
axarr[3].plot_date(x_vod,sent_vod_neg,'r-', label='negativos')
axarr[3].set_ylabel('VOD', fontsize=18)

# print x
# xticks(np.arange(12))
# axarr[2].set_xticks(x)
# axarr[2].set_xticklabels(
#         [date.strftime("%Y-%m-%d") for date in date_plot]
#         )

# f.text(0.5, 0.04, 'Sentiment 140',ha='center', va='center', fontsize=18)

show()