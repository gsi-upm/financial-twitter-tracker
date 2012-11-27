# -*- coding: utf-8 -*-
import tweetstream 
import time
import Queue
import threading
import cPickle
import os
import sys
from datetime import datetime
import tweetstream


class StreamCollector(threading.Thread):

    """ Filter """
    words = ["st"]
    """ Limit """
    limit = 1000000
    """ Twitter user/pass"""
    twitterUser = 'toni_gsi'
    twitterPass = 'gsigsi'

    def __init__(self, tweetsQueue, stop_event):
        threading.Thread.__init__(self)  
        self.queue = tweetsQueue
        self.stop_event = stop_event
        self.count = 0
        self.start_t = time.time()


    def collect(self):
        #with tweetstream.FilterStream(self.twitterUser, self.twitterPass, track=self.words) as stream:
        with tweetstream.SampleStream(self.twitterUser, self.twitterPass) as stream:
            for tweet in stream:

                #print tweet.get('text')

                if self.count and self.count % 100 == 0:
                    print "done with %d tweets in %s" % (self.count,datetime.now())

                if (self.count >= self.limit):
                    raise Exception('done');

                if tweet.get('text'):
                    if 'rt' in tweet.get('text').lower():
                        continue

                self.queue.put(tweet)

                self.count += 1

    def run(self):
        while True:
            try:
                self.collect()
            except Exception, e:
                print e
                if self.count >= self.limit:
                    self.stop_event.set()
                    break
            



class StreamWriter(threading.Thread):
    
    fileName = os.path.abspath(os.path.join( os.curdir,os.path.normpath('../data/tweets_raw.dat')))
    data = []
    
    def __init__(self, tweetsQueue, stop_event):
        threading.Thread.__init__(self)  
        self.queue = tweetsQueue
        self.stop_event = stop_event
        self.file = open(self.fileName,'ab')

    def run(self):
        while True:
            if self.stop_event.is_set():
                break;

            if self.queue.qsize() == 0:
                time.sleep(1)

            tweet = self.queue.get()
            self.queue.task_done()

            cPickle.dump(tweet, self.file,protocol=2)
               



try:
    tweetsQueue = Queue.Queue()
    stop_event = threading.Event()
    # collector thread
    c = StreamCollector(tweetsQueue, stop_event)
    c.daemon = True
    c.start()
    # writer thread
    w = StreamWriter(tweetsQueue, stop_event)
    w.daemon = True
    w.start()
    while True:
        time.sleep(100)

    print "Finished"

except KeyboardInterrupt:
     print "Ctrl-c pressed ..."
     sys.exit(1)