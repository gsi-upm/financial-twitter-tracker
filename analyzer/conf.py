# TRAINER
# words to search in twitter while training
TRAINER_COLLECTOR_WORDS = ["SP500", "forex",  "DowJones", "dow jones", "stocks market", "stocks finance"]
# name of the sentiwordnet file under /dict/sentiwordnet
SENTIWORDNET_DICT_FILENAME = "SentiWordNet_3.0.0_20100705.txt"
# if use the sentiwordnet dictionary (not included, more info in the README) or the simpler and included words list
USE_SENTIWORDNET_DICT = True

# ANALYZER
# LMF_URL = "http://lab.gsi.dit.upm.es/episteme/tomcat/LMF"
# LMF_URL = "http://localhost:8080/LMF-2.6.0"
LMF_URL = "http://localhost:8080/LMF"
# words to search on twitter
ANALYZER_SEARCH_WORDS = ["SP500", "forex",  "DowJones", "dow jones"]
# max number of terms to analyze, -1 to don't apply a limit
ANALYZER_LIMIT = 100