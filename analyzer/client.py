# -*- coding: utf-8 -*-
import sys
import tweetstream
import threading
import time
import Queue
import cPickle
import os
from lib.moodClassifierClient import MoodClassifierTCPClient
sys.path.append('dict')
import dictionary
import requests
# sys.path.append('../')
import nltk
import auth
import conf

#SERVER = "http://lab.gsi.dit.upm.es/episteme/tomcat/LMF/import/upload"
#SERVER = "http://localhost:8080/LMF/import/upload"
#SERVER = "http://127.0.0.1:8080/LMF-2.6.0/import/upload"
SERVER = conf.LMF_URL + "/import/upload"
RAW_DATA_FILE = 'data/tweets_raw.dat'
MOOD_DATA_FILE = 'data/tweets_mood.dat'
WORDS = conf.ANALYZER_SEARCH_WORDS
MCC = MoodClassifierTCPClient('127.0.0.1',6666)


class StreamCollector(threading.Thread):
	""" Limit """
	limit = conf.ANALYZER_LIMIT
	""" Twitter user/pass"""
	twitterUser = auth.TWITTER_USERNAME
	twitterPass = auth.TWITTER_PASSWORD

	def __init__(self, tweetsQueue, words):
		threading.Thread.__init__(self)  
		self.queue = tweetsQueue
		self.words = words
		self.count = 0


	def run(self):
		with tweetstream.FilterStream(self.twitterUser, self.twitterPass, track=self.words) as stream:
			for tweet in stream:
				if tweet.get('text'):
					if 'rt' in tweet.get('text').lower():
						continue
					#print tweet
					self.queue.put(tweet)
					self.count += 1
					if (self.limit >= 0): 
						if (self.count >= self.limit):
							break



class StreamWriter(threading.Thread):

	fileNameRaw = os.path.abspath(os.path.join( os.curdir,os.path.normpath(RAW_DATA_FILE)))
	fileNameMood = os.path.abspath(os.path.join( os.curdir,os.path.normpath(MOOD_DATA_FILE)))

	def __init__(self, tweetsQueue, words):
		threading.Thread.__init__(self)  
		self.queue = tweetsQueue
		self.words = words
		self.fileRaw = open(self.fileNameRaw,'w')
		self.fileMood = open(self.fileNameMood,'w')

	def run(self):
		while True:
			tweet = self.queue.get(block=True)
			cPickle.dump(tweet, self.fileRaw,protocol=1)
			text = unicode(tweet.get('text'));
			# tokens = nltk.word_tokenize(text)
			#TODO more languages
			# tokens = [w for w in tokens if not w in nltk.corpus.stopwords.words('english')]
			textMood = MCC.classify([{'text': text}], " ".join(self.words))
			if (textMood[0].get('x_mood') != 0.0):
				if (textMood[0].get('x_lang') == 'en'):
					print textMood[0].get('x_mood'), " -> ", textMood[0].get('text') 
					#print self.createFile(tweet, textMood, self.words)
			self.sendFile(tweet, textMood)

			cPickle.dump(tweet, self.fileMood, protocol=1)


	def sendFile(self, tweet, mood):
		params = {'context': 'default'}
		headers = {'Content-Type': 'application/rdf+xml'}
		data = self.createFile(tweet,mood, WORDS)
		files = {'file':  data}
		r = requests.post(SERVER, params=params, data=data, headers=headers)
		print r.headers
		print r.status_code , r.text

	def createFile(self, tweet, mood, words):
		s = """<?xml version="1.0" encoding="utf-8"?>
<rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/"
xmlns:dc="http://purl.org/dc/elements/1.1/"
xmlns:sioc="http://rdfs.org/sioc/ns#"
xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
xmlns:marl="http://purl.org/marl/">
	<rdf:Description rdf:about="https://api.twitter.com/1/statuses/show/"""
		s += tweet.get('id_str').encode('utf-8')
		s += """.json">
		<rdf:type rdf:resource="http://rdfs.org/sioc/types#MicroblogPost"/>
		<dc:title>"""
		s += self.returnTopic(tweet.get(u'text'), words)
		s += """</dc:title>
		<dcterms:created rdf:datatype="http://www.w3.org/2001/XMLSchema#dateTime">"""
		s += tweet.get('created_at').encode('utf-8')
		s += """</dcterms:created>
		<sioc:has_creator rdf:resource="https://twitter.com/"""
		s += tweet.get('user').get('screen_name').encode('utf-8')
		s += """"/>
		<marl:opinionText>"""
		s += tweet.get(u'text').encode('utf-8')
		s += """</marl:opinionText>
		<marl:polarityValue>"""
		s += str(mood[0].get('x_mood'))
		s += """</marl:polarityValue>
		<marl:minPolarityValue>-1</marl:minPolarityValue>
		<marl:maxPolarityValue>1</marl:maxPolarityValue>
		<marl:hasPolarity rdf:resource="http://purl.org/marl/ns#"""
		if mood[0].get('x_mood') > 0:
			s += 'Positive"/>'
		elif mood[0].get('x_mood') < 0:
			s += 'Negative"/>'
		else:
			s += 'Neutral"/>'
		s += """
	</rdf:Description>
</rdf:RDF>"""
		return s;

	def returnTopic(self, text, words):
		for word in words:
			if word.lower() in text.lower():
				return word
			if ('#' + word.lower()) in text.lower():
				return word
		return 'none'

def main():
	try:
		tweetsQueue = Queue.Queue()
		# collector thread
		c = StreamCollector(tweetsQueue, WORDS)
		c.daemon = True
		c.start()
		# writer thread
		w = StreamWriter(tweetsQueue, WORDS)
		w.daemon = True
		w.start()
		while True:
			c.join(1000)
		#	if not c.isAlive():
		#				break
		print "Finished"

	except KeyboardInterrupt:
		print "Ctrl-c pressed ..."
		sys.exit(1)

if  __name__ =='__main__':main()