# -*- coding: utf-8 -*-
import sys
sys.path.append('../../')
from tracker.lib.moodClassifierClient import MoodClassifierTCPClient


MCC = MoodClassifierTCPClient('127.0.0.1',6666)

test_data  = [
{'text':u'this is a test text 1'},
{'text':u'this is a test text 2'},
{'text':u'Prueba de idioma tiene que poner es en el tag y esto tiene que dar bueno asi que digo que es muy bonito'},
{'text':u'Otra prueba, el producto es muy malo'},
{'text':u'So nasty'},

]

print MCC.classify(test_data, 'search')
