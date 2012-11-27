import sys
import os
import csv



fileNamePos = os.path.abspath(os.path.join( os.curdir,os.path.normpath('dict/LoughranMcDonald_Positive.csv')))
s = ''
with open(fileNamePos,'r') as csvfile:
	reader = csv.reader(csvfile, delimiter=',')
	for row in reader:
		 s += ", '" + row[0] + "'"

print "positive = [" + s.lower() + "]";

print ""

fileNameNeg = os.path.abspath(os.path.join( os.curdir,os.path.normpath('dict/LoughranMcDonald_Negative.csv')))
s = ''
with open(fileNameNeg,'r') as csvfile:
	reader = csv.reader(csvfile, delimiter=',')
	for row in reader:
		 s += ", '" + row[0] + "'"
print "negative = [" + s.lower() + "]";
