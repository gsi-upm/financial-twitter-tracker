import pymongo
import datetime

import numpy as np

import statsmodels.tsa.stattools as st


fromDate = datetime.datetime(2013, 12, 12)
toDate = datetime.datetime(2014, 03, 13)

tickers = ['aapl', 'goog', 'amzn', 'ibe_en', 'ibe_es', 'san_en', 'san_es', 'vod_en', 'vod_es', 'tef_en']


W = 100

db = pymongo.MongoClient().ftt

results = open('emotion.txt', 'w')

for ticker in tickers:
	print ticker

	if (ticker == 'aapl' or ticker == 'goog' or ticker == 'amzn'):
		sentiment = 'davies'
		fromDate = datetime.datetime(2009, 05, 01)
		toDate = datetime.datetime(2010, 03, 31)
	else:
		sentiment = 'paradigma'
		fromDate = datetime.datetime(2013, 12, 12)
		toDate = datetime.datetime(2014, 03, 13)

	results.write(ticker.upper() + '\n')

	date = fromDate
	n_price = []
	emotion = {
		'anger': [],
		'happiness': [],
		'surprise': [],
		'sadness': [],
		'fear': [],
		'disgust': []
	}
	while date <= toDate:

		post = db[ticker].find({'date': date})

		if post.count() == 0:
			date = date + datetime.timedelta(days=1)
			continue
		else:
			post = post[0]

		# print post
		if post['emotion'] != {}:

			emotion['anger'].append(post['emotion']['anger'])
			emotion['happiness'].append(post['emotion']['happiness'])
			emotion['surprise'].append(post['emotion']['surprise'])
			emotion['sadness'].append(post['emotion']['sadness'])
			emotion['fear'].append(post['emotion']['fear'])
			emotion['disgust'].append(post['emotion']['disgust'])

		else:
			emotion['anger'].append(0)
			emotion['happiness'].append(0)
			emotion['surprise'].append(0)
			emotion['sadness'].append(0)
			emotion['fear'].append(0)
			emotion['disgust'].append(0)

		n_price.append(post['price'])
		# n_return.append(post['return'])
		# n_dates.append(date)

		date = date + datetime.timedelta(days=1)

	for key in emotion.keys():
		granger_array = np.array([np.array(n_price), np.array(emotion[key])]).T
		granger_results = st.grangercausalitytests(granger_array, 4, addconst=True, verbose=False)
		print key.upper()
		results.write('\t' + key.upper() + '\t\t\t\tLag1\t\t\tLag2\t\t\tLag3\t\t\tLag4')
		results.write('\n')
		results.write('\tssr_chi2test\t\t' + str(granger_results[1][0]['ssr_chi2test'][1]) + '\t\t' + 
			str(granger_results[2][0]['ssr_chi2test'][1]) + '\t\t' + 
			str(granger_results[3][0]['ssr_chi2test'][1]) + '\t\t' + 
			str(granger_results[4][0]['ssr_chi2test'][1]) + '\n')

		results.write('\tssr_ftest\t\t' + str(granger_results[1][0]['ssr_ftest'][1]) + '\t\t' + 
			str(granger_results[2][0]['ssr_ftest'][1]) + '\t\t' + 
			str(granger_results[3][0]['ssr_ftest'][1]) + '\t\t' + 
			str(granger_results[4][0]['ssr_ftest'][1]) + '\n')


exit()

# 	granger_array_positive = np.array([np.array(n_price), np.array(n_positivos)]).T
# 	# print len(n_price)
# 	# print len(n_negativos)
# 	# print granger_array_positive

# 	granger_positive = st.grangercausalitytests(granger_array_positive, 4, addconst=True, verbose=False)
# 	# print granger_positive[1][0]
# 	results.write('\tPositivos\n')
# 	results.write('\t\t\t\tLag1\t\t\tLag2\t\t\tLag3\t\t\tLag4')
# 	results.write('\n')
# 	results.write('\tssr_chi2test\t\t' + str(granger_positive[1][0]['ssr_chi2test'][1]) + '\t\t' + 
# 		str(granger_positive[2][0]['ssr_chi2test'][1]) + '\t\t' + 
# 		str(granger_positive[3][0]['ssr_chi2test'][1]) + '\t\t' + 
# 		str(granger_positive[4][0]['ssr_chi2test'][1]) + '\n')

# 	results.write('\tssr_ftest\t\t' + str(granger_positive[1][0]['ssr_ftest'][1]) + '\t\t' + 
# 		str(granger_positive[2][0]['ssr_ftest'][1]) + '\t\t' + 
# 		str(granger_positive[3][0]['ssr_ftest'][1]) + '\t\t' + 
# 		str(granger_positive[4][0]['ssr_ftest'][1]))

# 	results.write('\n')


# 	granger_array_negative = np.array([np.array(n_price), np.array(n_negativos)]).T
# 	print granger_array_negative
# 	granger_negative = st.grangercausalitytests(granger_array_negative, 4, addconst=True, verbose=False)

# 	results.write('\n\tNegativos\n')
# 	results.write('\t\t\t\tLag1\t\t\tLag2\t\t\tLag3\t\t\tLag4')
# 	results.write('\n')
# 	results.write('\tssr_chi2test\t\t' + str(granger_negative[1][0]['ssr_chi2test'][1]) + '\t\t' + 
# 		str(granger_negative[2][0]['ssr_chi2test'][1]) + '\t\t' + 
# 		str(granger_negative[3][0]['ssr_chi2test'][1]) + '\t\t' + 
# 		str(granger_negative[4][0]['ssr_chi2test'][1]) + '\n')

# 	results.write('\tssr_ftest\t\t' + str(granger_negative[1][0]['ssr_ftest'][1]) + '\t\t' + 
# 		str(granger_negative[2][0]['ssr_ftest'][1]) + '\t\t' + 
# 		str(granger_negative[3][0]['ssr_ftest'][1]) + '\t\t' + 
# 		str(granger_negative[4][0]['ssr_ftest'][1]))

# 	results.write('\n\n')

# # Pintar
# # # n_dates = matplotlib.dates.date2num(n_dates)
# # ax[0].plot_date(n_dates, np.array(n_return), color='green', linestyle='-', marker='')
# # ax[1].plot_date(n_dates, np.array(n_predicted), color='red', linestyle='-', marker='')

# # ax[1].plot_date(n_dates, np.array(n_price), color='blue', linestyle='-', marker='')
# # ax[1].set_xlabel('Price', color='b')
# # for tl in ax[1].get_yticklabels():
# # 	tl.set_color('b')

# # ax2 = ax[1].twinx()
# # ax2.plot_date(n_dates, np.array(n_tis), color='black', linestyle='-', marker='')
# # ax2.set_ylabel('TIS')



# # years    = mdates.YearLocator()   # every year
# # months   = mdates.MonthLocator()  # every month
# # yearsFmt = mdates.DateFormatter('%Y')
# # # format the ticks
# # ax.xaxis.set_major_locator(years)
# # ax.xaxis.set_major_formatter(yearsFmt)
# # ax.xaxis.set_minor_locator(months)

# # ax.set_xlim(fromDate, toDate)

# # def price(x): return '$%1.2f'%x
# # ax.format_xdata = mdates.DateFormatter('%Y-%m-%d')
# # ax.format_ydata = price
# # ax.grid(True)
# # fig.autofmt_xdate()


# # plt.show()