tickers = ['aapl', 'goog', 'amzn']

for ticker in tickers:
	src1 = open('twitter/' + ticker, 'r')
	src2 = open('twitter/' + ticker + '_140', 'r')

	dst = open('sentiment_140/' + ticker, 'w')

	for line1 in src1:

		tweet = line1.split('\t')

		line2 = src2.readline()

		sentiment = int(line2[1:2])

		if sentiment == 0:
			dst.write(tweet[0] + '\t' + tweet[1] + '\t' + tweet[2] + '\t' + tweet[3] + '\t' + tweet[4][0:-1] + '\t' + '0' + '\t' + 'negative' + '\n')
		if sentiment == 4:
			dst.write(tweet[0] + '\t' + tweet[1] + '\t' + tweet[2] + '\t' + tweet[3] + '\t' + tweet[4][0:-1] + '\t' + '1' + '\t' + 'positive' + '\n')

	src1.close()
	src2.close()
	dst.close()