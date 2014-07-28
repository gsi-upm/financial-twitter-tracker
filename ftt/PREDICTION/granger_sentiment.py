import pymongo
import datetime

import numpy as np
import matplotlib
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import matplotlib.cbook as cbook

import statsmodels.tsa.stattools as st

fig, ax = plt.subplots(nrows=2, ncols=1, sharex=True)

fromDate = datetime.datetime(2013, 12, 12)
toDate = datetime.datetime(2014, 03, 13)

tickers = ['aapl', 'goog', 'amzn', 'ibe_en', 'san_en', 'vod_en', 'tef_en']


W = 100

db = pymongo.MongoClient().ftt

results = open('results_p.txt', 'w')

for ticker in tickers:
	print ticker

	if (ticker == 'aapl' or ticker == 'goog' or ticker == 'amzn'):
		sentiment = 'viralheat'
		fromDate = datetime.datetime(2009, 05, 01)
		toDate = datetime.datetime(2010, 03, 31)
	else:
		sentiment = 'paradigma'
		fromDate = datetime.datetime(2013, 12, 12)
		toDate = datetime.datetime(2014, 03, 13)

	# results.write(ticker.upper() + '\n')

	date = fromDate
	n_positivos = []
	n_negativos = []
	n_bind = []
	n_tis = []
	n_price = []
	n_return = []
	n_dates = []
	n_emotion = []
	while date <= toDate:

		post = db[ticker].find({'date': date})

		if post.count() == 0:
			date = date + datetime.timedelta(days=1)
			continue
		else:
			post = post[0]

		# print post
		if post[sentiment] != {}:
			n_positivos.append(post[sentiment]['pos'])
			n_negativos.append(post[sentiment]['neg'])
			n_tis.append(post[sentiment]['TIS'])
			n_bind.append(post[sentiment]['bind'])
			n_emotion.append(post['emotion']['surprise'])
		else:
			n_positivos.append(0)
			n_negativos.append(0)
			n_tis.append(1)
			n_bind.append(1)
			n_emotion.append(0)
		n_price.append(post['price'])
		n_return.append(post['return'])
		n_dates.append(date)

		date = date + datetime.timedelta(days=1)


	# dst = open('salida_modelo.csv', 'w')

	# dst.write('dia,price,price_-1,return,return_-1,pos,neg,bind,tis,rtis,return_2,return_7,price_2,price_7\n')

	# price1 = n_price[1:]
	# price2 = n_price[2:]
	# price7 = n_price[7:]
	# returnn1 = n_return[1:]
	# returnn2 = n_return[2:]
	# returnn7 = n_return[7:]
	# pos = n_positivos[1:]
	# neg = n_negativos[1:]
	# bind = n_bind[1:]
	# tis = n_tis[1:]
	# rtis = n_tis[1:]

	# i = 0

	# for i in range(len(price7)):
	# 	dst.write(str(i) + ',' + str(price1[i]) + ',' + str(n_price[i]) + ',' + str(returnn1[i]) + ',' + 
	# 		str(n_return[i]) + ',' + str(pos[i]) + ',' + str(neg[i]) + ',' + str(bind[i]) + ',' + 
	# 		str(tis[i]) + ',' + str(rtis[i]) + ',' + str(returnn2[i]) + ',' + str(returnn7[i]) + ',' +
	# 		str(price2[i]) + ',' + str(price7[i]) + '\n')

	# dst.close()

	# exit()

	granger_array_positive = np.array([np.array(n_price), np.array(n_emotion)]).T
	# print len(n_price)
	# print len(n_negativos)
	# print granger_array_positive

	granger_positive = st.grangercausalitytests(granger_array_positive, 4, addconst=True, verbose=True)
	print granger_positive[1][0]
	


	granger_array_negative = np.array([np.array(n_price), np.array(n_negativos)]).T
	# print granger_array_negative
	granger_negative = st.grangercausalitytests(granger_array_negative, 4, addconst=True, verbose=True)


	# results.write('\tPositivos\n')
	# results.write('\t\t\t\tLag1\t\t\tLag2\t\t\tLag3\t\t\tLag4')
	# results.write('\n')

	results.write(ticker.upper() + ' & ' + ('%.4f' % granger_positive[1][0]['ssr_ftest'][1]) + ' & ' + 
		('%.4f' % granger_positive[2][0]['ssr_ftest'][1]) + ' & ' + 
		('%.4f' % granger_positive[3][0]['ssr_ftest'][1]) + ' & ' + 
		('%.4f' % granger_positive[4][0]['ssr_ftest'][1]) + ' \\\\\n\\hline')

	results.write('\n')

	# results.write('\n\tNegativos\n')
	# results.write('\t\t\t\tLag1\t\t\tLag2\t\t\tLag3\t\t\tLag4')
	# results.write('\n')

	# results.write('\tssr_ftest\t\t' + str(granger_negative[1][0]['ssr_ftest'][1]) + '\t\t' + 
	# 	str(granger_negative[2][0]['ssr_ftest'][1]) + '\t\t' + 
	# 	str(granger_negative[3][0]['ssr_ftest'][1]) + '\t\t' + 
	# 	str(granger_negative[4][0]['ssr_ftest'][1]))

	# results.write('\n\n')

# Pintar
# # n_dates = matplotlib.dates.date2num(n_dates)
# ax[0].plot_date(n_dates, np.array(n_return), color='green', linestyle='-', marker='')
# ax[1].plot_date(n_dates, np.array(n_predicted), color='red', linestyle='-', marker='')

# ax[1].plot_date(n_dates, np.array(n_price), color='blue', linestyle='-', marker='')
# ax[1].set_xlabel('Price', color='b')
# for tl in ax[1].get_yticklabels():
# 	tl.set_color('b')

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


# plt.show()