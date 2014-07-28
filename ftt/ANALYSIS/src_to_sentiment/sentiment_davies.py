import numpy as np

tickers = ['aapl', 'goog', 'amzn']

def readSentimentList(file_name):
    ifile = open(file_name, 'r')
    happy_log_probs = {}
    sad_log_probs = {}
    ifile.readline() #Ignore title row
    
    for line in ifile:
        tokens = line[:-1].split(',')
        happy_log_probs[tokens[0]] = float(tokens[1])
        sad_log_probs[tokens[0]] = float(tokens[2])

    return happy_log_probs, sad_log_probs

def classifySentiment(words, happy_log_probs, sad_log_probs):
    # Get the log-probability of each word under each sentiment
    happy_probs = [happy_log_probs[word] for word in words if word in happy_log_probs]
    sad_probs = [sad_log_probs[word] for word in words if word in sad_log_probs]

    # Sum all the log-probabilities for each sentiment to get a log-probability for the whole tweet
    tweet_happy_log_prob = np.sum(happy_probs)
    tweet_sad_log_prob = np.sum(sad_probs)

    # Calculate the probability of the tweet belonging to each sentiment
    prob_happy = np.reciprocal(np.exp(tweet_sad_log_prob - tweet_happy_log_prob) + 1)
    prob_sad = 1 - prob_happy

    return prob_happy, prob_sad

def main():
    # We load in the list of words and their log probabilities
    happy_log_probs, sad_log_probs = readSentimentList('twitter_sentiment_list.csv')

    positive = 0
    negative = 0
    neutral  = 0
    for ticker in tickers:

        src = open('twitter/' + ticker, 'r')
        dst = open('sentiment_davies/' + ticker, 'w')
        
        for line in src:
            if (line == ''):
                continue
            # print line
            tweet = line.split('\t')
            tweet_text = tweet[3].split(' ')

            happy_prob, sad_prob = classifySentiment(tweet_text, happy_log_probs, sad_log_probs)

            if happy_prob > 0.5:
                positive += 1
                dst.write(tweet[0] + '\t' + tweet[1] + '\t' + tweet[2] + '\t' + tweet[3] + '\t' + tweet[4][0:-1] + '\t' + str(happy_prob) + '\t' + 'positive' + '\n')
            if happy_prob < 0.5:
                negative += 1
                dst.write('\t'.join(tweet) + '\t' + str(happy_prob) + '\t' + 'negative' + '\n')
            if happy_prob == 0.5:
                neutral += 1

            # print ' '.join(tweet_text)
            # print 'Happy: ' + str(happy_prob)
            # print 'Sad: ' + str(sad_prob) + '\n'
    print 'Tweets positivos: ' + str(positive)
    print 'Tweets negativos: ' + str(negative)
    print 'Tweets neutros: ' + str(neutral)

if __name__ == '__main__':
    main()