import sys

import cPickle
import os
import calendar
import time
import re
import gzip
import sys
import multiprocessing
sys.path.append('../')
#from dateutil import parser
from lib.lang_detection import LangDetect
from lib.supportedLangs import supportedLangs
from lib.mood_detection import MoodDetectTrainData, MoodDetectTrainer, MoodDetect
sys.path.append('../dict')
import dictionary
sys.path.append('../dict/sentiwordnet')
sys.path.append('../dict')
from sentiwordnet import SentiWordNetCorpusReader, SentiSynset
from nltk.corpus import wordnet as wn
import nltk
import conf


class RawClassifier(object):
    statsData = {}
    limit = {}
    skip = 0
    p2_f_limit = 0.6
    sentiwordnet = conf.USE_SENTIWORDNET_DICT
    
    def __init__(self,traing_data_fileP1='mood_traing_p1.dat',traing_data_fileP2='mood_traing.dat',data_file='tweets_raw.dat'):
        if self.sentiwordnet:
            print "using sentiwordnet dictionary"
        else:
            print "not using sentiwordnet dictionary"

        self.clsP1 = MoodDetectTrainer(data_file = traing_data_fileP1)
        self.clsP2 = MoodDetectTrainer(data_file = traing_data_fileP2)
        
        self.langClassifier = LangDetect(supportedLangs)
        
        self.training_data_p1 = MoodDetectTrainData()
        self.training_data_p2 = MoodDetectTrainData()
        
        self.tweetsFile = open(os.path.join(os.curdir, os.path.normpath('../data/' + data_file)) ,'rb')
        self.countRows(self.tweetsFile)

        self.tweetsFile = open(os.path.join(os.curdir , os.path.normpath('../data/' + data_file)) ,'rb')

        self.limit['en'] = 300000
        self.limit['default'] = 10000
        self.count = 0

        swn_filename = '../dict/sentiwordnet/' + conf.SENTIWORDNET_DICT_FILENAME
        self.swn = SentiWordNetCorpusReader(swn_filename)

        
    
    def classifyP1(self,stripSmiles=False):
        self.classifiyRaw(self.tweetsFile,stripSmiles)
        self.clsP1.train(self.training_data_p1)
        print "done training P1"
        
        print self.statsData
        
    def classifyP2(self):
        """
            remove noisy n-grams 
        """
        _st={'tf':0,'df':0}
        
        for feutures,label in self.training_data_p1:
            lang = feutures.pop('x_lang')
            feuturesP2 = feutures.copy()
            
            for f,v in feutures.items():
               prob = self.clsP1.classifier.prob_classify({f:v,'x_lang':lang}) 
               
               
               _st['tf']+=1
               
               if max(prob.prob('n'),prob.prob('p')) <= self.p2_f_limit:
                   del feuturesP2[f]
                   _st['df']+=1
            
            if len(feuturesP2) >= 3:
                feuturesP2['x_lang']=lang
                self.training_data_p2.append((feuturesP2,label))
            else:
                pass
            
        print 'p2_length:' , len(self.training_data_p2), ' p1_lenght:' , len(self.training_data_p1)  
        print 'st:' , _st
        
        print "deleting p1 set"
        del self.training_data_p1
        del self.clsP1
        print "Done deleting p1 set"
        self.clsP2.train(self.training_data_p2)
        
    
    def stripSmiles(self,text):
        emos = [':)',':-)',';-)',': )',':d','=)',':p',';)','<3',':(',':-(',': (']
        
        for item in emos:
            text = text.replace(item,"")
        return text         
    
    def stats(self,lang,mood):
        if not self.statsData.has_key(lang):
            self.statsData[lang] = {'n':0,'p':0}
        
        if self.limit.has_key(lang):
            limit = self.limit[lang]
        else:
            limit = self.limit['default']

        if self.statsData[lang][mood] >= limit:
            return 0
        else:
            self.statsData[lang][mood]+=1
            return 1

    # CHECK WITH SENTIWORDNET
    def checkWithSentiwordnet(self, text):
        count = 0
        tokens = nltk.word_tokenize(text)
         #TODO more languages
        #tokens = [w for w in tokens if not w in nltk.corpus.stopwords.words('english')]
        if len(tokens) > 0:
            for token in tokens: 
                synsets = self.swn.senti_synsets(token)
                if len(synsets) > 0: 
                    # TODO no tiene por que ser este lemma. Comprobar la categoria 
                    lemma = synsets[0] 
                    count = count + lemma.pos_score - lemma.neg_score
            #print count, " points for tokens :", tokens
            if count > 0.5:
                return 'p'
            if count < 0.5:
                return 'n'
        return 'x'
    
    # CHECK WITH FINANCIAL DICTIONARIES 
    def checkWithFinancialDict(self,text):
        count = self.containsPositiveWord(text) + self.containsNegativeWord(text);
        if count > 0:
            return 'p'
        if count < 0:
            return 'n'
        return 'x'

    def containsPositiveWord(self,text):
        count = 0
        for item in dictionary.positive:
            if item in text:
                count += 1                
                #print 'p:',item
        return count


    def containsNegativeWord(self,text):
        count = 0
        for item in dictionary.negative:
            if item in text:
                #print 'n:', item
                count -= 1                
        return count


    def classifiyRaw(self,file,stripSmiles):
        while True:
            try:
                tweet = cPickle.load(file)
            except EOFError:
                print "done classify"
                break
            except:
                print "error"
                pass
            
            if self.skip > 0:
                print "skip"
                self.skip -= 1
                continue
            
            if tweet:
                text = unicode(tweet.get('text'))
                
                if text.lower().find('rt ') != -1:
                    print 'rt'
                    continue


                lang  = self.langClassifier.detect(text)
                # TODO more languages
                if lang[0] != 'en':
                    continue

                if stripSmiles:
                    text = self.stripSmiles(text)

                if self.sentiwordnet:
                    mood = self.checkWithSentiwordnet(text)
                else:     
                    mood = self.checkWithFinancialDict(text)

                if mood == 'x':
                    continue
                
                sres = self.stats(lang[0], mood)
                if sres == 0:
                    # limite de idioma alcanzado
                    print 'limit reached for ' , lang[0]
                    continue


                if sres == -1:
                    print "done for %s" % mood
                    break
                
                if self.count and self.count % 100 == 0:
                    print "classified %d tweets" % (self.count)
                self.count += 1

                self.training_data_p1.addRow(text, mood, lang[0])

    
    def countRows(self,file):
        rows = 0
        breakes = 0
        while True:
            try:
                tweet = cPickle.load(file)
                rows +=1
            except EOFError:
                break
            except:
                breakes +=1
        print 'tweets:',rows,' breakes:',breakes
        
    
def main():
    cls = RawClassifier(traing_data_fileP1='mood_traing_p1.dat',
                        traing_data_fileP2='mood_traing.dat',
                        data_file='tweets_raw.dat')
    # limit the number of tweets for en 
    cls.limit['en'] = 1000000
    # default lang limit
    cls.limit['default'] = 10000
    # second filter threshold
    cls.p2_f_limit = 0.6
    # do not strip icons from trainging data
    cls.classifyP1(stripSmiles=False)
    cls.classifyP2()
    cls.clsP2.save()
    
    # train test data
    
    #cls = RawClassifier(traing_data_fileP1='mood_traing_test_50000.dat',traing_data_fileP2='mood_traing.dat',data_p_file='tweets_positive_raw.dat',data_n_file='tweets_negative_raw.dat')
    #cls.skip = 300000
    #cls.limit['en'] = 50000
    #cls.limit['deafult'] = 1000
    #cls.classifyP1(stripSmiles=True)
    #cls.clsP1.save()
    
if  __name__ =='__main__':main()