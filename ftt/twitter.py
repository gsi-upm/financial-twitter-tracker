import tweepy
import datetime
import time

import os

import sys
reload(sys)
sys.setdefaultencoding("UTF-8")

p_stdout = os.path.join(os.path.dirname(__file__), 'stdout.log')
sys.stdout = open(p_stdout, 'a')

app_key = ''
app_secret = ''

auth = tweepy.OAuthHandler(app_key, app_secret)
# auth.set_access_token(access_key, access_secret)
api = tweepy.API(auth)

tickers = ['goog', 'amzn']

p_log = os.path.join(os.path.dirname(__file__), 'log/logtwitter.log')
log = open(p_log, 'a')
log.write('Script ejectuado. ' + datetime.datetime.now().isoformat() + '\n')
log.close()

for ticker in tickers:

	p_ticker = os.path.join(os.path.dirname(__file__), 'infochimps_files/' + ticker)
	ticker_file =  open(p_ticker,  'r')
	ticker_file_data = ticker_file.read().split('\n')
	ticker_file_data_copy = list(ticker_file_data)
	ticker_file.close()

	# log.write('Tweets de ' + ticker + ' totales: ' + str(len(ticker_file_data)) + '\n')

	p_twitter = os.path.join(os.path.dirname(__file__), 'twitter_raw/' + ticker)
	twitter_file = open(p_twitter, 'a')

	contador = 0
	rechazados = 0

	for line in ticker_file_data_copy:

		# print len(ticker_file_data)

		if line == '':
			continue

		line = line.split('\t')
		print line
		id_tweet = line[2]

		try:
			text_tweet = api.get_status(int(id_tweet))
			twitter_file.write(line[0] + '\t' + line[1] + '\t' + line[2] + '\t' + text_tweet.text + '\t' + text_tweet.user.screen_name + '\n')
			ticker_file_data.pop(0)
			contador += 1
		except tweepy.TweepError as e:
			if e.message[0]['code'] == 88:
				twitter_file.close()
				
				ticker_file = open(p_ticker, 'w')
				ticker_file.write('\n'.join(ticker_file_data))
				ticker_file.close()

				print 'Rate limit exceeded. Wait 15 minutes.'
				print 'Tweets de ' + ticker + ' analizados: ' + str(contador)
				print 'Tweets de ' + ticker + ' rechazados: ' + str(rechazados)
				print 'Sleep. ' + datetime.datetime.now().isoformat()

				log = open(p_log, 'a')
				log.write('Limite alcanzado. ' + datetime.datetime.now().isoformat() + '\n')
				log.write('Tweets restantes: ' + str(len(ticker_file_data)) + '\n')
				log.close()

				time.sleep(920)

				twitter_file = open(p_twitter, 'a')

				# break
				# exit()


			else:
				ticker_file_data.pop(0)
				contador += 1
				rechazados += 1


	ticker_file = open(p_ticker, 'w')
	ticker_file.write('\n'.join(ticker_file_data))
	ticker_file.close()

	log = open(p_log, 'a')
	log.write('Tweets de: ' + ticker + 'analizados\n')
	log.close()
