import pymongo
import datetime
import math

import numpy as np
import matplotlib
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import matplotlib.cbook as cbook


import statsmodels.tsa.stattools as st

client = pymongo.MongoClient()
db = client.vix

n_vix = []
n_fear = []

for post in db['vix'].find().sort('date', 1):

	n_vix.append(post['vnx'])
	n_fear.append(post['fear_ip'])

granger_array = np.array([np.array(n_vix), np.array(n_fear)]).T

granger_positive = st.grangercausalitytests(granger_array, 7, addconst=True, verbose=True)
print granger_positive[1][0]