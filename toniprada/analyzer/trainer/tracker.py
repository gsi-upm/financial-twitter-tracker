import tweepy
import sys
from textwrap import TextWrapper



auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
auth.set_access_token(access_token, access_token_secret)

class StreamListener(tweepy.StreamListener):
    status_wrapper = TextWrapper(width=60, initial_indent='    ', subsequent_indent='    ')

    def on_status(self, status):
        try:
            print '\n %s  %s  via %s\n' % (status.author.screen_name, status.created_at, status.source)
            print status.text

        except Exception, e:
            # Catch any unicode errors while printing to console
            # and just ignore them to avoid breaking application.
            pass

streamer = tweepy.Stream(auth=auth, listener=StreamListener(), timeout=3000000000 )
setTerms = ['happy', 'delighted', 'merry', 'cheerful']
streamer.filter(None,setTerms)