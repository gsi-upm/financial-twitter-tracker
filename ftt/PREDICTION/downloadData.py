import urllib2
import datetime
import collections

urlBase = "http://ichart.yahoo.com/table.csv?s="

def getData(ticker, fromDay, toDay):
	if (ticker == 'goog'): ticker = 'googl'
	if (ticker == 'ibe_en' or ticker == 'ibe_es') : ticker = 'ibe.mc'
	if (ticker == 'san_en' or ticker == 'san_es') : ticker = 'san.mc'
	if (ticker == 'tef_en' or ticker == 'tef_es') : ticker = 'tef.mc'
	if (ticker == 'vod_en' or ticker == 'vod_es') : ticker = 'vod'
	
	stringUrl = ''
	if toDay != None:
		#			month						   day						year
		stringUrl = "&d=" + str(toDay.month - 1) + "&e=" + str(toDay.day) + "&f=" + str(toDay.year)
	
	if fromDay != None:
		stringUrl = "&a=" + str(fromDay.month - 1) + "&b=" + str(fromDay.day) + "&c=" + str(fromDay.year) + stringUrl

	stringUrl = urlBase + ticker + stringUrl

	print stringUrl

	dataCSV = urllib2.urlopen(stringUrl).read()

	return formatData(dataCSV)

def formatData (data):
	collection = collections.OrderedDict()

	dataArray = data.split('\n')
	dataArray.pop(0)
	dataArray.pop()
	dataArray.reverse()

	for line in dataArray:
		lineArray = line.split(',')
		fecha = lineArray[0].split('-')
		key = datetime.date(int(fecha[0]), int(fecha[1]), int(fecha[2]))
		collection[key] = float(lineArray[4])

	return collection

def getVariation (data):
	
	collection = collections.OrderedDict()
	keys = data.keys()

	for i in range(len(data) - 1):
		variacion = data[keys[i+1]] - data[keys[i]]
		# collection[keys[i+1]] = variacion
		if variacion > 0:
			collection[keys[i+1]] = 1
		elif variacion < 0:
			collection[keys[i+1]] = -1
		else:
			collection[keys[i+1]] = 0		

	return collection