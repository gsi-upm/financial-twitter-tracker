import pymongo
import datetime
import math

import numpy as np
import matplotlib
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import matplotlib.cbook as cbook

client = pymongo.MongoClient()
db = client.vix


n_dates = []
n_real = []
n_predicted = []

for post in db['vix'].find().sort('date', 1):
	if not 'vnx_p_base' in post:
		continue

	n_dates.append(post['date'])
	n_real.append(post['vnx'])
	n_predicted.append(post['vnx_p_aapl'])

# RMSE
suma_RMSE = 0

for i in range(len(n_real)):
	suma_RMSE += math.pow(n_real[i] - n_predicted[i], 2) 

RMSE = math.sqrt(suma_RMSE / len(n_real))

# rmse_string += ('%.4f'%RMSE) + ' & '
print RMSE

# MAPE
suma_MAPE = 0

for i in range(len(n_real)):
	# if (n_real[i] == 0):
	# 	print 'cero'
	# 	n_real[i] = 0.00001
	suma_MAPE += math.fabs((n_real[i] - n_predicted[i]) / n_real[i])

MAPE = (suma_MAPE / len(n_real))*100

# mape_string += ('%.4f'%MAPE) + ' & '
print MAPE


# print rmse_string
# print mape_string
# exit()

# precios_real = []
# precios_pred = []

# for i in range(len(n_real)):

# 	# REAL
# 	precios_real.append(price_inicial*(1+n_real[i]))

# 	# PREDICHO
# 	precios_pred.append(price_inicial*(1+n_predicted[i]))

# 	price_inicial = precios_real[-1]


fig, ax = plt.subplots()#snrows=2, ncols=1, sharex=True)

ax.scatter(n_real, n_predicted, color='blue')

# print 'M1'
print np.corrcoef(n_real, n_predicted)

# ax.plot_date(n_dates, np.array(n_real), color='green', linestyle='-', marker='o')
# ax.plot_date(n_dates, np.array(n_predicted), color='red', linestyle='--', marker='x')
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