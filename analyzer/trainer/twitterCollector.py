# -*- coding: utf-8 -*-
import time
import Queue
import threading
import cPickle
import os
import sys
from datetime import datetime
sys.path.append('../')
import authCredentials
import conf
import tweepy

class StreamCollector(threading.Thread):

    words = conf.TRAINER_COLLECTOR_WORDS
    consumer_key = authCredentials.consumer_key;
    consumer_secret = authCredentials.consumer_secret
    access_token= authCredentials.access_token
    access_token_secret= authCredentials.access_token_secret
    auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
    auth.set_access_token(access_token, access_token_secret)


    def __init__(self, tweetsQueue, stop_event):
        threading.Thread.__init__(self)  
        self.queue = tweetsQueue
        self.stop_event = stop_event
        self.count = 0
        self.start_t = time.time()


    def collect(self):
        streamer = tweepy.Stream(auth=self.auth, listener=StreamListener(self.queue, self.stop_event), timeout=3000000000 )
        streamer.filter(None,self.words)
            

    def run(self):
        while True:
            try:
                self.collect()
            except Exception, e:
                print e
                #if self.count >= self.limit:
                #    self.stop_event.set()
                #    break


class StreamListener(tweepy.StreamListener):
    count = 0;
    limit = 1000000

    def __init__(self, tweetsQueue, stop_event):
        super(StreamListener, self).__init__()
        self.queue = tweetsQueue
        self.stop_event = stop_event


    def on_status(self, status):
        try:
           
            if self.count and self.count % 10 == 0:
                print "done with %d tweets in %s" % (self.count,datetime.now())
            if (self.count >= self.limit):
                raise Exception('done');
            if status.text:
                if 'rt' not in status.text.lower():
                    print str(status.text) + "\n"
                    self.queue.put(status)
                    self.count += 1

        except Exception, e:
            # Catch any unicode errors while printing to console
            # and just ignore them to avoid breaking application.
            pass

            

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
               
def main():
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

if  __name__ =='__main__':main()