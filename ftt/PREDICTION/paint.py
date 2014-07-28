import pymongo
import datetime
import math

import numpy as np
import matplotlib
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import matplotlib.cbook as cbook

# tickers = ['aapl', 'amzn', 'goog', 'ibe_en', 'san_en', 'vod_en', 'tef_en'] 
# tickers = ['vod_en']
# ticker = 'vod_en'
ticker = 'vod_en'


client = pymongo.MongoClient()
db = client.pred

rmse_string = ''
mape_string = ''



n_dates = []
n_real = []
n_predicted_with_p = []
n_predicted_with_e = []

price_final = 0
first = True

for post in db[ticker].find().sort('date', 1):
	if not 'prediction_emotion_base' in post:
		continue

	# print post['date']
	# print post['price']
	# print post['prediction_sentiment_pos']

	if first:
		price_final = post['price']
		first = False

	# n_dates.append(post['date'])
	# n_real.append(post['price'])
	# n_predicted_with_p.append(post['prediction_emotion_base'])
	# n_predicted_with_e.append(post['prediction_emotion_anger'])

	n_dates.append(post['date'])
	n_real.append(post['price'])
	n_predicted_with_p.append(post['prediction_emotion_base'])
	n_predicted_with_e.append(post['prediction_emotion_anger'])

price_inicial = price_final / (1 + n_real[0])
print price_inicial

# # print n_real[0]
# # print n_predicted[0]

# # print [x.day for x in n_dates]

# # print len(n_dates)
# # print len(n_real)
# # print len(n_predicted)
# # print price_final
# # print price_inicial
# # print n_dates[0]
# # exit()

# # RMSE
# suma_RMSE = 0

# for i in range(len(n_real)):
# 	suma_RMSE += math.pow(n_real[i] - n_predicted[i], 2) 

# RMSE = math.sqrt(suma_RMSE / len(n_real))

# print RMSE

# # rmse_string += ('%.4f'%RMSE) + ' & '

# # MAPE
# suma_MAPE = 0

# for i in range(len(n_real)):
# 	# if (n_real[i] == 0):
# 	# 	print 'cero'
# 	# 	n_real[i] = 0.00001
# 	suma_MAPE += math.fabs((n_real[i] - n_predicted[i]) / n_real[i])

# MAPE = (suma_MAPE / len(n_real))*100

# print MAPE
# # mape_string += ('%.4f'%MAPE) + ' & '

# # print rmse_string
# # print mape_string
# # exit()

# precios_real = []
# precios_pred = []
# precios_base = []

# for i in range(len(n_real)):

# 	# REAL
# 	precios_real.append(price_inicial*(1+n_real[i]))

# 	# BASE
# 	precios_base.append(price_inicial*(1+n_predicted_with_p[i]))

# 	# PREDICHO
# 	precios_pred.append(price_inicial*(1+n_predicted_with_e[i]))

# 	price_inicial = precios_real[-1]


font={'size': 18}
matplotlib.rc('font', **font)



fig, ax = plt.subplots()#snrows=2, ncols=1, sharex=True)

fig.subplots_adjust(left=0.07, bottom=0.06, right=0.94, top=0.97, hspace=0.12)

# ax.scatter(precios_real, precios_pred, color='blue')

# print 'M1'
# print np.corrcoef(precios_real, precios_pred)

# for i in range(184):
# 	n_dates.pop(0)
# 	precios_real.pop(0)
# 	precios_base.pop(0)
# 	precios_pred.pop(0)

# print len(precios_real)

# ax.plot_date(n_dates, np.array(precios_real), color='green', linestyle='-', lw=5)
# ax.plot_date(n_dates, np.array(precios_pred), color='red', linestyle='--', marker='x', markersize=10, lw=5)
# ax.plot_date(n_dates, np.array(precios_base), color='blue', linestyle='--', lw=5)
# # ax.plot_date(n_dates, np.array(n_positivos), color='blue', linestyle='-', marker='x')


ax.plot_date(n_dates, np.array(n_real), color='green', linestyle='-', marker='o', lw=5)
ax.plot_date(n_dates, np.array(n_predicted_with_e), color='red', linestyle='--', marker='x', lw=5, markersize=10)
ax.plot_date(n_dates, np.array(n_predicted_with_p), color='blue', linestyle='-', marker='x', lw=5)
# ax.plot_date(n_dates, np.array(n_positivos), color='blue', linestyle='-', marker='x')

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


plt.show()