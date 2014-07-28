import pymongo
import datetime

import numpy as np
import matplotlib
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import matplotlib.cbook as cbook

fig, ax = plt.subplots(nrows=7, ncols=1, sharex=True)

fromDate = datetime.datetime(2009, 05, 01)
toDate = datetime.datetime(2010, 03, 31)

ticker = 'aapl'
sentiment = 'davies'

db = pymongo.MongoClient().ftt

date = fromDate
n_dates = []
n_price = []
n_anger = []
n_happiness = []
n_disgust = []
n_fear = []
n_sadness = []
n_surprise = []

while date <= toDate:

	post = db[ticker].find({'date': date})

	if post.count() == 0:
		date = date + datetime.timedelta(days=1)
		continue
	else:
		post = post[0]

	if 'anger' in post:
		n_anger.append(post['anger'])
	else:
		n_anger.append(0)

	if 'happiness' in post:
		n_happiness.append(post['happiness'])
	else:
		n_happiness.append(0)

	if 'fear' in post:
		n_fear.append(post['fear'])
	else:
		n_fear.append(0)

	if 'surprise' in post:
		n_surprise.append(post['surprise'])
	else:
		n_surprise.append(0)

	if 'disgust' in post:
		n_disgust.append(post['disgust'])
	else:
		n_disgust.append(0)

	if 'sadness' in post:
		n_sadness.append(post['sadness'])
	else:
		n_sadness.append(0)

	n_price.append(post['price'])
	n_dates.append(date)

	date = date + datetime.timedelta(days=1)


# Pintar
# n_dates = matplotlib.dates.date2num(n_dates)
ax[0].plot_date(n_dates, n_price, color='black', linestyle='-', marker='')
ax[0].set_ylabel('Price')
ax[1].plot_date(n_dates, n_anger, color='black', linestyle='-', marker='')
ax[1].set_ylabel('Anger')
ax[2].plot_date(n_dates, n_disgust, color='black', linestyle='-', marker='')
ax[2].set_ylabel('Disgust')
ax[3].plot_date(n_dates, n_fear, color='black', linestyle='-', marker='')
ax[3].set_ylabel('Fear')
ax[4].plot_date(n_dates, n_happiness, color='black', linestyle='-', marker='')
ax[4].set_ylabel('Happiness')
ax[5].plot_date(n_dates, n_sadness, color='black', linestyle='-', marker='')
ax[5].set_ylabel('Sadness')
ax[6].plot_date(n_dates, n_surprise, color='black', linestyle='-', marker='')
ax[6].set_ylabel('Surprise')

# ax[1].plot_date(n_dates, np.array(n_price), color='blue', linestyle='-', marker='')
# ax[1].set_xlabel('Price', color='b')
# for tl in ax[1].get_yticklabels():
	# tl.set_color('b')

# ax2 = ax[1].twinx()
# ax2.plot_date(n_dates, np.array(n_tis), color='black', linestyle='-', marker='')
# ax2.set_ylabel('TIS')



# years    = mdates.YearLocator()   # every year
# months   = mdates.MonthLocator()  # every month
# yearsFmt = mdates.DateFormatter('%Y')
# # format the ticks
# ax.xaxis.set_major_locator(years)
# ax.xaxis.set_major_formatter(yearsFmt)
# ax.xaxis.set_minor_locator(months)

# ax.set_xlim(fromDate, toDate)

# def price(x): return '$%1.2f'%x
# ax.format_xdata = mdates.DateFormatter('%Y-%m-%d')
# ax.format_ydata = price
# ax.grid(True)
# fig.autofmt_xdate()


plt.show()