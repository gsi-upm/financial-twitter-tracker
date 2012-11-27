       //default configuration (overloaded by webservice)
       var configuration = {
            "widgets" : [],
	    "baseURL" : ["http://shannon.gsi.dit.upm.es/episteme/lmf/solr/ftt/"],
		"language" : "",
	    "sparql_baseURL" : ["http://shannon.gsi.dit.upm.es/episteme/lmf/sparql/select"],
	    "layout" : {
		"pageTitle" : "",
		"logoPath": "images/logo.png"
	    },
            "results" : {
		"wcolor": "color-red",
		"wtitle": "Resultados",
		"wtype": "results",
		"wcollapsed" : "not collapsed",
                "title":"lmf.uri",
                "link":"lmf.uri",
                "author":"lmf.author",
                "description":"",
                "thumb":"",
                "created":"lmf.created",
		"extra" : [],
		"resultsLayout" : [
{
    Name: ko.observable("Títulos"),
    Value: ko.observable("name")},
{
    Name: ko.observable("Subtítulo"),
    Value: ko.observable("autor")},
{
    Name: ko.observable("Descripción"),
    Value: ko.observable("text")},
	
	{Name: ko.observable("Puntuación"),
    Value: ko.observable("polarity")},
]	
	
            },
            "autocomplete" : {
				"field": "name"
            },
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
		"available_languages": ["Español", "Inglés", "Alemán"],
		"lightmode": false,
		"default_language": "Inglés",
		"showMap": false
            }
       }
