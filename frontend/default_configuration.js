//default configuration (overloaded by webservice)
		//"serverURL": "http://shannon.gsi.dit.upm.es/episteme/lmf/",
var configuration = {
	"widgets" : [],
	"endpoints" : {
		"serverURL": "http://localhost:8080/LMF/",
		"baseURL" : [""],
		"sparql_baseURL" : []
	},
	"template" : {
		"pageTitle" : "Financial Twitter Tracker",
		"logoPath": "",
		"showMapWidget": "",
		"showResultsWidget": true,
		"language": "Spanish"
	},
    "results" : {
		"wcolor": "color-red",
		"wtitle": "Tweets",
		"wtype": "results",
		"wcollapsed" : false,
		"extra" : [],
		"resultsLayout" : [
		{
			Name: "Títulos",
			Value: "label"},
		{
			Name: "Subtítulo",
			Value: "birthDate"},
		{
			Name: "Descripción",
			Value: "abstract"},
		{
			Name: "Logo",
			Value: "photo"},
		]},
	"autocomplete" : {
		"field": "province"},
	"searchengine" : {
	     	
	},
	"mapWidget" : {
		"latitude": "latitud",
		"longitude": "longitud"
	},
    "other" : {
        "sort":{
            "field":"name",
            "order":"asc"
        },
		"available_languages": ["Español"],
		"lightmode": false,
		"default_language": "Español",
		"showMap": true
    }
}
