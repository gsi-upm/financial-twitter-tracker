#financial-twitter-tracker

A semantic sentiment analyzer for tweets with a financial context. It's currently under development.

## Installation:

1. Download LMF and follow [the installation guide](https://code.google.com/p/lmf/wiki/InstallationSetup). Don't forget to set *LMF_HOME* in *$CATALINA_HOME/bin/setenv.sh* and give full access to the tomcat user in UNIX systems.
2. Download and install (with [python-setuptools](https://pypi.python.org/pypi/setuptools)) the [tweetstream module](https://pypi.python.org/pypi/tweetstream).
3. Download and install [nltk](http://nltk.org/).
4. Download and install [requests](http://docs.python-requests.org/)

## Usage:

### Training the analyzer

The first time you will need to train the analyzer. The quality of the semantic annotation is related on the amount of tweets and their quality.

1. Go to /analyzer/trainer/
2. To train the analizer we need a lot of tweets. Execute *twitterCollector.py* to get a stream of filtered tweets and save them in */analyzer/data/tweets_raw.dat*. Sucesive executions will append more tweets to this file.
3. We also need the [SentiWordNet sentiment dictionary](http://sentiwordnet.isti.cnr.it/), to use this dictionary you'll need to ask for it and is not included in the repository, and to place it under */analyzer/dict/sentiwordnet*. A simpler financial [dictionary](http://www.nd.edu/~mcdonald/Word_Lists.html) it's also included and can be used setting *USE_SENTIWORDNET_DICT* to *False* in the configuration file.
4. Execute *tweetClassifier.py*.

### Getting semantic annotated tweets and saving them in LMF

1. Go to /analyzer
2. Execute *moodClassifierd.py debug* and wait for it to start;
3. Modify *client.py* to select what words do you want to search in twitter.
4. Execute *client.py* in other terminal.

### Configure LMF

1. We need to create a core for the semantic search. Under *Semantic search*->*Core*, create a new core with this content:

 ```
@prefix dc : <http://purl.org/dc/elements/1.1/> ;
@prefix sioc : <http://rdfs.org/sioc/ns#> ;
@prefix rdf : <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ;
@prefix marl : <http://purl.org/marl/> ;
@prefix dcterms : <http://purl.org/dc/terms/> ;
@filter rdf:type is <http://rdfs.org/sioc/types#MicroblogPost> ;
  title = dc:title :: xsd:string ;
  created = dcterms:created :: xsd:string ;
  has_creator = sioc:has_creator :: xsd:string ;
  opinionText = marl:opinionText :: xsd:string ;
  polarityValue = marl:polarityValue :: xsd:string ;
  minPolarityValue = marl:minPolarityValue :: xsd:string ;
  maxPolarityValue = marl:maxPolarityValue :: xsd:string ;
  hasPolarity = marl:hasPolarity :: xsd:string ;
 ```

### Showing the data in the web frontend

*(TODO)*

## Thanks to

- Cyhex for [smm](https://github.com/cyhex/smm).
- [Natural Language Toolkit](http://nltk.org/).
- [Loughran and McDonald Financial Sentiment Dictionaries](http://www.nd.edu/~mcdonald/Word_Lists.html)
- [SentiWordNet](http://sentiwordnet.isti.cnr.it/).
- Christopher Potts for [SentiWordNet Python inferface](http://compprag.christopherpotts.net/wordnet.html#sentiwordnet).

## License

GPLv3
