//default configuration (overloaded by webservice)
//"serverURL": "http://shannon.gsi.dit.upm.es/episteme/lmf/",
//"serverURL": "http://lab.gsi.dit.upm.es/episteme/tomcat/LMF/",
//		"serverURL": "http://127.0.0.1:8080/LMF-2.6.0/",
// 	"lmfUrl" : "http://localhost:8080/LMF-2.6.0/",


var configuration = {
	"lmfUrl" : "http://localhost:8080/LMF/",
	"widgetsLeft" : [],
	"widgetsRight" : [],
	"endpoints" : {
		"serverURL": "http://localhost:8080/LMF/",
		"baseURL" : [""],
		"sparql_baseURL" : []
	},
	"template" : {
		"pageTitle" : "financial-twitter-tracker",
		"logoPath": "",
		"showMapWidget": false,
		"showResultsWidget": true,
		"language": "Español"
	},
    "results" : {
		"wcolor": "color-red",
		"wtitle": "Resultados",
		"wtype": "results",
		"wcollapsed" : false,
		"wgraphscollapsed" : false,
		"wshowConfig": false,
		"extra" : [],
		"resultsGraphs" : [],
		"resultsLayout" : [
		{
			Name: "Title",
			Value: "hasPolarity"},
		{
			Name: "Subtitle",
			Value: "polarityValue"},
		{
			Name: "Description",
			Value: "opinionText"},
		{
			Name: "Logo",
			Value: "photo"},
	]},
	"autocomplete" : {
		"field": "",
		"actived": "false"},
	"searchengine" : {
	     	
	},
	"mapWidget" : {
		"latitude": "latitude",
		"longitude": "longitude"
	},
    "other" : {
        "sort":{
            "field":"name",
            "order":"asc"
        },
		"available_languages": ["Español"],
		"lightmode": false,
		"maxNumberOfResults": "100",
		"default_language": "Español",
		"showMap": true
    }
}
