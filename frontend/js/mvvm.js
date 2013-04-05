
/** YOU MUST EDIT THIS LINE */
//var serverURL = "http://localhost:8080/LMF/";
var serverURL = "http://lab.gsi.dit.upm.es/episteme/tomcat/LMF/";

var map;
var i_layoutresultsextra = 0;

var Manager;
var markers = [];

var coreSelected;

var firstTime = true;
var autocompleteSOLR = [];

//templateWidgets = [{"id":5,"title": "No borrar", "type": "tagcloud", "field":"type","collapsed":false,"values":[]},{"id":0,"title": "Provincias", "type": "tagcloud", "field":"province","collapsed":false,"values":[]},{"id":1,"title": "Provincias (Gŕafico)", "type": "sgvizler", "query":"SELECT ?o WHERE { ?s <http://www.w3.org/2006/vcard/ns#locality> ?o}","collapsed":false,"value":""}];
templateWidgets = [];	

function InitViewModel() {
	
	var self = this;
	
	/** Endpoint variables */
	self.serverURL = ko.observable(serverURL);
	self.solr_baseURL = ko.observable();
	//self.sparql_baseURL = ko.observable("http://localhost:8080/LMF/sparql/select");
	self.sparql_baseURL = ko.observable();
	self.core = ko.observable();
	self.listCores = ko.observableArray();
	
	/** Template variables */
	self.pageTitle = ko.observable(configuration.template.pageTitle);
	self.logoPath = ko.observable();
	self.showMapWidget = ko.observable();
	self.showTwitterWidget = ko.observable(false);
	self.showConfigurationPanel = ko.observable(false);
	self.showResultsWidget = ko.observable(true);
	self.openEditResultsLayout = ko.observable(false);
	self.openNewWidgetManager = ko.observable(false);
	self.resultsWidget = ko.mapping.fromJS(configuration.results);
	self.resultsLayout = ko.mapping.fromJS(configuration.results.resultsLayout);
	self.editingTitle = ko.observable();
	self.autoCompleteFields = ko.observableArray([]);
	self.autocomplete_fieldname = ko.observable(configuration.autocomplete.field);
	
	/** Language */
	self.lang = ko.observable(languages[0]);
	self.selectedLanguage = ko.observable(configuration.template.language);	
	
	
	/** Active route */
	self.page = ko.observable();
	/** Routes */
	//self.goToMain = function() { location.hash = "#/main/" + self.core() };
	//self.goToGraphic = function() { location.hash = "#/graph/" + self.core() };
	
	
	/** Configuration variables */
	self.sortBy = ko.observable();
	self.sparql = ko.observable(false);
	self.dbpedia = ko.observable(false);
	self.lightmode = ko.observable(false);
	
	/** All data */
	self.testData = [];
	self.viewData = ko.mapping.fromJS(self.testData);
	
	/** Text in search field */
	self.filter = ko.observable();
	
	/** Type of field what we are searching for (i.e: province) */
	self.filterType = ko.observable();
	
	/** Filtered Data with activeWidgets */
	self.filteredCategory = ko.observableArray();
	
	/** Extra plugins */
	self.currentTweets = ko.observableArray([]); // No se usa
	self.mapLat = ko.observable(configuration.mapWidget.latitude);
	self.mapLong = ko.observable(configuration.mapWidget.longitude);
	self.sgvizlerQuery = ko.observable("SELECT ?o WHERE { ?s <http://www.w3.org/2006/vcard/ns#locality> ?o}");
	
	/** TagCloudWidgets related */
	self.widgetContent = ko.observableArray();
	self.activeWidgets = ko.mapping.fromJS(self.testData);


	
	/** Returns all data given a field (i.e type: province returns [facet: "Madrid", count: "5"]...)  */
	ko.utils.getDataColumns = function(type) {  
		console.log("RESPONSE:");  
		console.log(Manager.response);
		/** Local mode */
		if(self.lightmode()){
			var response = [];
			var results = ko.utils.arrayMap(self.filteredData(), function(item) {
				
				if(item[type]!=undefined) {
					if(self.sparql()){
						return item[type].value();
						}else{
						return item[type]()[0];
					}
				}
			});
			
			var different = ko.utils.arrayGetDistinctValues(results).sort();
			
			for(var i in different){
				var count = countElement(different[i], results);
				response.push({ facet: different[i], count: count});
			}
			
			return response.sort();
			
			}else{
			
			if (Manager.response.facet_counts.facet_fields[type] === undefined) {
				return ["No se ha podido recuperar información"];
			}
			
			var maxCount = 0;
			var objectedItems = [];
			
			for (var facet in Manager.response.facet_counts.facet_fields[type]) {
				
				var count = parseInt(Manager.response.facet_counts.facet_fields[type][facet]);
				if (count > maxCount) {
					maxCount = count;
				}	
				
				objectedItems.push({ facet: facet, count: count });
			}
			
			objectedItems.sort(function (a, b) {
				return a.facet < b.facet ? -1 : 1;
			});
			
			
			return objectedItems.sort();
		}
	};
	
	/** This function populate all tagcloud widgets content */
	function updateWidgets(){
		console.log("updatewidgets");
		$.each(self.activeWidgets(), function(index, item) {
			if(item.type()=="tagcloud"){
				self.widgetContent(ko.utils.getDataColumns(item.field()));
				populateWidgets(index);
			}
		});
	};
	
	/** each value is a tag:
		id: 0
		name: Madrid
		state: false/true (depending on if we clicked on it or not)
	*/
	
	function populateWidgets(pIndex){
		var parent = self.activeWidgets()[pIndex];
		var countIndex = 0;      
		
		parent.values.removeAll();
		
		$.each(self.widgetContent(), function(index, item) {  ; 
			
			parent.values.push(
			{"id": ko.observable(countIndex++),
				"name": ko.observable(self.widgetContent()[index].facet),
				"state": ko.observable(false)
			}
			);
		});  
		
		parent.values.sortByPropertyCat('id');
	}
	
	/** This function deletes a widget */
	self.deleteWidget = function(widget) {
		self.activeWidgets.remove(widget);									
	};
	
	/** Collapse a given widget */
	self.collapseWidget = function() {
		var val = this.collapsed();
		this.collapsed(!val);
	};	
	
	/** When a tag in TagCloud widget is clicked we switch its state */
	self.tagCloudSelection = function(pIndex, index, field) {
		
		/*
			var parent_match = ko.utils.arrayFilter(self.activeWidgets(), function(item) {
			if(item.id()==pIndex) {
			return item;
			}
			});
			
			var parent = parent_match[0];
		*/
		
		var parent = self.activeWidgets()[pIndex];
		
		
		var temp = !parent.values()[index()].state();  
		
		parent.values.remove(function(item) {
			return item.name() == field;
		});   
		
		parent.values.push(
		{"id": index,
			"name": ko.observable(field),
			"state": ko.observable(temp)
		});
		
		parent.values.sortByPropertyCat('id');		
		
		if(!self.lightmode()){
			updateSolrFilter();
		}
	};
	
	/** Language related functions */
	self.languages = ko.computed(function () {
		var response = new Array();
		for(var i=0, l = languages.length; i<l; i++){
			response.push(languages[i].lang);	
		}	
		return response;
	});
	
	self.selectedLanguageIndex = ko.dependentObservable(function() {
		return self.languages().indexOf(self.selectedLanguage());
	}, self);
	
	/** Subscribe to changes on language's select */
	self.selectedLanguage.subscribe(function (newValue) {
		var idx = self.selectedLanguageIndex();
		
		if(idx>-1){
			self.lang(languages[parseInt(idx)]);
			}else{
		}
		
	});
	
	/** Test method when clicking on "Voy a tener suerte" button */
	self.test = function (){
		console.log("TEST");
	};
	
	/** Reindex SOLR button */
	self.reindexSOLR = function (){
		$.ajax({
			type:"POST",
			url: self.serverURL() + "solr/cores/reinit",
			success: function(data){
				
				$.blockUI.defaults.growlCSS.top = '30px'; 
				$.growlUI('Reindexación realizada con éxito', ''); 	
				//Manager.store.remove('fq');
				//Manager.doRequest();
				//firstTime=true;			
			},
			error: function() {
				alert("Error al reindexar");
			}
		});		
	};
	
	/** Add a custom graph given a sparql query */
	self.addSgvizlerWidget = function() {
		var id = Math.floor(Math.random() * 10001);
		self.activeWidgets.push({"id":ko.observable(id),"title": ko.observable("Nuevo Gráfico"), "type": ko.observable("sgvizler"), "query":self.sgvizlerQuery(),"collapsed": ko.observable(false),"value":ko.observableArray([])});
		saveConfiguration(true);
		
	};		
	
	/** This computed function gets fields contained in a certain response from any sparql/solr query (i.e: province, name, type...) */
	self.dataColumns = ko.computed(function() {
		var mapping = _.map(self.viewData(), function(element){ 
		return Object.keys(element); });
		var flat = _.reduce(mapping, function(a,b){return a.concat(b); }, [] );
		var unique = _.uniq(flat);
		
		return unique;
	});
	
	/** When "sort by" select option changes, sort viewData */
	self.sortBy.subscribe(function (newValue) {
		if(newValue!=undefined && self.lightmode()){
			self.viewData.sortByPropertyAsc(newValue);
			ko.utils.arrayFilter(self.viewData(), function(itm) {
				
			});				
		}
	});		
	
	/** When switching from light/heavy mode, reset all filters and doRequest */
	self.lightmode.subscribe(function (newValue) {
		self.filter("");
		Manager.doRequest();
	});
	
	
	/** Unused method but could be useful */
	self.listArray = function(field){
		
		var provinces = ko.utils.arrayMap(self.filteredData(), function(item) {
			if(item[field]!=undefined) {
				return item[field]()[0];
			}
		});
		
		return ko.utils.arrayGetDistinctValues(provinces).sort();			
	};


	
	/** Shows popup to edit fields that are shown in results widget */
	self.editResultsLayout = function (){
		self.openEditResultsLayout(true);
	};
	
	/** We use input field to make sparql queries (this will change soon) */
	self.filter.subscribe(function (newValue){
		if(self.sparql()){
			self.getResultsSPARQL(newValue);
		}
	});
	
	/** This function does a mapping from json (response) to self.viewData and updateWidgets */
	self.getResultsSPARQL = function(sparql_query){
		
		var queryText = sparql_query;	
		var endpoint = self.sparql_baseURL();
		var finalQuery = queryText;
		
		if(self.dbpedia()){
			queryText = queryText.replace(/\s/g, "_");
			var queryResource = "<http://dbpedia.org/resource/" + queryText + ">";
			finalQuery="PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>PREFIX dbo: <http://dbpedia.org/ontology/>PREFIX dbpprop: <http://dbpedia.org/property/>PREFIX foaf: <http://xmlns.com/foaf/0.1/> SELECT DISTINCT ?label ?abstract ?nationality ?birthDate ?photo WHERE {" + queryResource + " rdfs:label ?label .OPTIONAL {" + queryResource + " dbo:abstract ?abstract .}OPTIONAL {" + queryResource + " foaf:page ?page .}OPTIONAL {" + queryResource + " dbpprop:nationality ?nationality .}OPTIONAL {" + queryResource + " dbpprop:birthPlace ?birthPlace .}OPTIONAL {" + queryResource + " dbpprop:birthDate ?birthDate .}OPTIONAL {" + queryResource + " dbo:thumbnail ?photo .}FILTER (LANG(?label) = 'es')FILTER (LANG(?abstract) = 'es')}";
			endpoint = "http://dbpedia.org/sparql";
		}
		
		//var finalQuery="select * where {<http://dbpedia.org/resource/"+ queryText +"> <http://xmlns.com/foaf/0.1/name> ?name ; <http://dbpedia.org/property/birthDate> ?birth ; <http://dbpedia.org/property/nationality> ?nationality ; <http://dbpedia.org/ontology/thumbnail> ?photo }";
		finalQuery = encodeURIComponent(finalQuery);
		finalQuery = decodeURIComponent(finalQuery);
		
		$.ajax({	
			type: 'GET',
			url: endpoint,
			data: { query: finalQuery, output: 'json' },
			beforeSend: function(){				
				//$('#loading').show();
			},
			complete: function(){
				//$('#loading').hide();
			},
			success: function(allData) {    
				var data = JSON.stringify(allData.results.bindings);
				
				ko.mapping.fromJSON(data, self.viewData);
				updateWidgets();
			},
			error: function() {
				//$('#docs').append("Consulta fallida");  
			}
		});   
	};	
	
	/** Filters the results widget using tags which state is true */
	self.filteredCategory = ko.computed(function() {  
		var data = self.viewData();
		var filtro = self.activeWidgets();
		
		if(!filtro){
			return self.viewData();  
			}else{
			tempFilter = self.viewData();
			$.each(self.activeWidgets(), function(index1, item1) {
				if(item1.type()=="tagcloud" && self.lightmode()){
					tempString = "";
					catParent = item1.field();
					//console.log(item1.values());
					$.each(item1.values(), function(index2, item2) {
						if(item2.state() == true){
							tempString += " "+item2.name();
							//console.log(tempString);
						}
					});
					
					tempFilter = ko.utils.arrayFilter(tempFilter, function(item) {
						if(item[catParent]!=undefined){			
							if(self.sparql()){
								return ko.utils.stringContains(item[catParent].value().toString(), tempString);
								}else{
								return ko.utils.stringContains(item[catParent]().toString(), tempString);
							}
						}
					});
				}
			});
			
			return tempFilter;
		}
	},self);	
	
	/** Final data visualized in results widget (after text filter through input if exists) */
	self.filteredData = ko.computed(function() {  

		var data = self.filteredCategory();
		//console.log(data)
		
		/** Search box filter */
		var filter = self.filter();
		var filterType = "name";
		////console.log("FILTER ES: " + filterArray);
		if(!self.sparql()){
			if(!filter){
				return data;  
				}else if(self.lightmode()){
				return ko.utils.arrayFilter(data, function(item) {
					if(item[filterType]!=undefined) {
						return ko.utils.stringStartsWith(item[filterType]().toString(), filter);
					}
				});
				}else{
				return data;
			}
			
			}else{
			return data;
		}
	},self);
	
	/** If results widget data changes, we must update the graphics on top */
	self.filteredData.subscribe(function (newValue) {

		//console.log("FILTERED_DATA: " +  ko.toJSON(newValue))
		
		$(".graphics").empty();
		
		$.each(self.activeWidgets(), function(index, item) {
			//console.log("ITEM:" + ko.toJSON(item));
			if(item.type()=="tagcloud"){
				
				$(".graphics").append("<div id='" + item.id()+ "'></div>");
				
				var t = ko.utils.getDataColumns(item.field());
				//console.log("T:" + ko.toJSON(t))
				var temp = [['Header',0]];
				for(var i=0, l = t.length; i<l; i++){
					temp.push([t[i].facet,t[i].count]); 
				}
				var datos =  ko.toJS(temp);
				var data = google.visualization.arrayToDataTable(temp);
				new google.visualization.PieChart(document.getElementById(item.id())).draw(data, {title:item.title()});	
			}
		});
		// Wheel
		var array = new Array();
		$.each(self.filteredData(), function(index, item) {
			var one;
			var name = new String(item.name());
			var resultOne = $.grep(array, function(e){ return e["name"].valueOf() == name.valueOf(); });
			if (resultOne.length == 0) {
				one = new Object();
				one["name"] = name;
				one["children"] = new Array();
				array.push(one);
			} else {
				one = resultOne[0];
			}
			var two;
			var polarity = new String(item.polarity_type()[0]).substring(24);
			var resultTwo = $.grep(one["children"], function(e){ return e["name"].valueOf() == polarity.valueOf(); });
			if (resultTwo.length == 0) {
				two = new Object();
				two["name"] = polarity;
				two["children"] = new Array();
				one["children"].push(two);
			} else {
				two = resultTwo[0];
			}
			var three = new Object();
			three["name"] = new String(item.text());
			var value = parseFloat(item. polarity());
			//var hex = 5*Math.abs(value) + 250;
			//var hexString = ("0" + hex.toString(16)).slice(-2);	
			//console.log(hexString);
			if (value <  -0.1) {
				three["colour"] = "#FE2E2E";
			} else if (value > 0.1) {
				three["colour"] = "#2EFE2E"; 
			} else {
				three["colour"] = "#2E64FE"; 
			}
			two["children"].push(three);
		});
		$("#vis").fadeOut();
		setTimeout(function() {
			updateWheel(JSON.stringify(array));
			$("#vis").fadeIn();
		},300);
		var arrayBarras = new Array();
		$.each(self.filteredData(), function(index, item) {
			var value = parseFloat(item. polarity());
			if (value <  -0.1 || value > 0.1) {
				arrayBarras.push(item. polarity());
			}
		});
		$("#barras").fadeOut();
		setTimeout(function() {
			updateBarras(JSON.stringify(arrayBarras));
			$("#barras").fadeIn();
		},300);

		



	/*foreach(array_keys($salida) as $company){
	$a_comp = array();
	foreach(array_keys($salida[$company]) as $polarity){
		$a_pol = array();
		foreach($salida[$company][$polarity] as $tw){
			$a_pol[]=array('name'=>$tw,'colour'=>$colores[$indice_colores]);
		}
		$a_comp[] = array('name'=>$polarity,'children'=>$a_pol);
	}
	$datos[] = array('name'=>$company,'children'=>$a_comp);
	$indice_colores++;
	if ($indice_colores >= sizeof($colores))$indice_colores=0; 
	}*/

		//updateWheel("../script_conversorWheel.php");

		// El widget necesita todos los datos inicialmente, asi que hacerlo distinto: 
		// cuando filtres en knockout, clickear en el widget, y viceversa
		//wheelClickWithName(filter)

	});




	/** Autocomplete in search box (TO DO)*/
	self.autoComplete = ko.computed(function() {
		if(!isBlank(self.autocomplete_fieldname())){
			//if(!self.lightmode()){
			/*
				var ac_fields = new Array([]);			
				
				return ko.utils.arrayMap(autocompleteSOLR, function(item) {
				if(item!=undefined) {					
				ac_fields.push(item);
				}
				});
			*/
			
			//console.log(self.autoCompleteFields());
			//return self.autoCompleteFields();
			
			
		//}else{
		
		var data = self.filteredData();
		var ac_fieldname = self.autocomplete_fieldname();
		var ac_fields = new Array([]);
		
		return ko.utils.arrayMap(data, function(item) {
			if(item[ac_fieldname]!=undefined) {
				
				ac_fields.push(item[ac_fieldname]().toString());
			}
		});
		
		return ko.utils.arrayGetDistinctValues(ac_fields).sort();
		//			}
		}else{
		return "";
	}
});


/** Twitter widget methods */
self.twitterList = ko.computed(function() {
	var data = self.filteredData();
	
	return ko.utils.arrayFilter(data, function(item) {
		if(item.name!=undefined && self.showTwitterWidget()) {
			////console.log(item.name().toString());
			return item.name();
		}
	});
},self);

//self.twitterList = ko.observableArray(["INDRA Software Labs", "ALTRAN"]);
ko.computed(function() {
	twitterApi.getTweetsForUsers(self.twitterList(), self.currentTweets);
}, self);


/** Map widget related methods */
self.mapLat.subscribe(function (newValue) {
	removeMapMarkers();
});	

self.mapLong.subscribe(function (newValue) {
	removeMapMarkers();
});	


/** Show/hide configuration */
self.showConfiguration = function() {
	var value = self.showConfigurationPanel();
	self.showConfigurationPanel(!value);
};

/** After every Manager.doRequest method we map the new results into viewData observable */
self.update = function() {
	if(self.sparql()){
		
		}else{
		ko.mapping.fromJS(Manager.response.response.docs, self.viewData);
		//console.log("AUTOCOMPLETESOLR");
		//console.log(autocompleteSOLR);
		self.autoCompleteFields(autocompleteSOLR);
		if(firstTime){	
			console.log("Actualizamos widgets");
			updateWidgets();
			firstTime=false;
		}			
	}
	
};

/** Tutorial */
self.showHelp = function() {
	$('#TipContent').joyride({
		'scrollSpeed': 300,              // Page scrolling speed in ms
		'timer': 0,                   // 0 = off, all other numbers = time(ms) 
		'startTimerOnClick': false,       // true/false to start timer on first click
		'nextButton': true,              // true/false for next button visibility
		'tipAnimation': 'fade',           // 'pop' or 'fade' in each tip
		'pauseAfter': [],                // array of indexes where to pause the tour after
		'tipAnimationFadeSpeed': 800,    // if 'fade'- speed in ms of transition
		'cookieMonster': false,           // true/false for whether cookies are used
		'cookieName': 'JoyRide',         // choose your own cookie name
		'cookieDomain': false,           // set to false or yoursite.com
	});
};

self.newTagCloudValue = ko.observable();
/** Open wizard for a new widget */
self.openNewWidgetManagerMethod = function() {
	self.openNewWidgetManager(true);
};

/** Widget's editing title function */
self.editTitle = function(title) {
	self.editingTitle(title);
};

/** To change field of tagcloudwidget dynamically (not used ATM) */	
self.selectionChanged = function(event) {
	//alert("New value: " + this.field());  
	// Borramos todos los filtros previos
	Manager.store.remove('fq');		 
	
	var field = this.field();
	
	var params = {
		facet: true,
		'facet.field': field,
		'facet.limit': 20,
		'facet.sort': 'count',
		'facet.mincount': 1,
		'json.nl': 'map'
	};
	
	for (var name in params) {
		Manager.store.addByValue(name, params[name]);
	}
	
	if(self.lightmode()){
		updateWidgets();
		}else{
		//Manager.store.remove('fq');
		//updateSolrFilter();
		//Manager.doRequest();
		//firstTime=true;
	}		 
};	

/** Adding a new TagCloudWidget */
self.addTagCloudWidget = function() {
	
	var id = Math.floor(Math.random() * 10001);
	var field = self.newTagCloudValue();
	
	id_obs = ko.observable(id);
	field_obs = ko.observable(field);
	self.activeWidgets.push({"id":ko.observable(id),"title": ko.observable("Nuevo Widget"), "type": ko.observable("tagcloud"), "field": ko.observable(self.newTagCloudValue()),"collapsed": ko.observable(false),"values":ko.observableArray()});
	
	var params = {
		facet: true,
		'facet.field': field,
		'facet.limit': 20,
		'facet.sort': 'count',
		'facet.mincount': 1,
		'json.nl': 'map'
	};
	
	for (var name in params) {
		Manager.store.addByValue(name, params[name]);
	}
	
	if(self.lightmode()){
		updateWidgets();
		}else{
		Manager.store.remove('fq');
		Manager.doRequest();
		firstTime=true;
	}
};

/** Save button */
self.doSave = function() {
	saveConfiguration();
};

routes();

/** Depending on the html route, redirect to a setup screen or directly to visualization screen */
function routes(){
	if(self.serverURL() == ""){
		self.page(4);
		}else{
		
		// Client-side routes    
		sammyPlugin = $.sammy(function() {
			this.bind('redirectEvent', function(e, data) {
				this.redirect(data['url_data']);
			});
			
			this.get('#/main', function(context) {
				console.log("ERROR");
				
				setupMethod();
				self.page(3);
			});
			
			this.get('#/main/:coreId', function() {
				self.core(this.params.coreId);
				coreSelected = this.params.coreId;
				
				var solr_baseURL = serverURL + 'solr/' + self.core() + '/';
				self.solr_baseURL(solr_baseURL);
				
				/** Cargamos la configuración para el core dado */
				loadCore();			
			});
			
			this.get('#/sparql', function() {
				self.sparql = ko.observable(true);
				self.lightmode = ko.observable(true);		
				
				init();
			});
			
			this.get('#/graph/:coreId', function(context) {
				
				
			});
			this.notFound = function(){
				console.log("RUTA NO ENCONTRADA");
				self.page(1);
			}			
		}).run('#/main'); 
	}
}

/** Error window asking user to select a core */
function setupMethod() {
	/*
		$.ajax({
		url: self.serverURL() + 'solr/cores',
		success: function(data){
		console.log(data);
		var array = JSON.parse(data);
		console.log(array);
		self.listCores(array);
		//console.log(data);
		},error: function() {
		//console.log("error");			
		}
		});	
	*/
	$.getJSON(self.serverURL() + 'solr/cores', function(data) { 
		self.listCores(data);
	});
	
	self.start = function (){
		location.hash = '#/main/' + self.core();
		window.location.reload();
	}
};

/** If core exists, go to loadConfiguration method. Otherwise, show an error */
function loadCore() {
	$.getJSON(self.solr_baseURL() + "admin/luke?show=schema&wt=json",function(data){                    
		loadConfiguration();
	}).error(function() { self.page(2); setupMethod(); });
};

/** Load configuration for a given core */
function loadConfiguration(){
	$.ajax({
		url: "http://shannon.gsi.dit.upm.es/episteme/lmf/config/data/search.config." + self.core(),
		success: function(data){
			
			configuration = JSON.parse(data['search.config.'+self.core()]);
			
			for (var i = 0; configuration.widgets.length > i; i++) {	
				templateWidgets.push({ id: configuration.widgets[i].id, title: configuration.widgets[i].title, type: configuration.widgets[i].type,field: configuration.widgets[i].field , collapsed: configuration.widgets[i].collapsed, query: configuration.widgets[i].query, value: [], values: []});
			}
			
			init();
		},
		error: function() {
			init();			
		}
	});
};

function init(){
	
	self.page(0);
	
	/** Update values from loaded (or not) configuration */
	/** Endpoint variables */
	
	var sparql_baseURL = self.serverURL() + 'sparql/select';
	self.sparql_baseURL(sparql_baseURL);
	
	/** Overriding some template variables */
	self.pageTitle(configuration.template.pageTitle);
	self.logoPath(configuration.template.logoPath);
	self.showMapWidget = ko.observable(configuration.template.showMapWidget);
	self.showResultsWidget = ko.observable(configuration.template.showResultsWidget);
	self.resultsWidget = ko.mapping.fromJS(configuration.results);
	self.resultsLayout = ko.mapping.fromJS(configuration.results.resultsLayout);
	self.selectedLanguage(configuration.template.language);	
	
	self.activeWidgets = ko.mapping.fromJS(templateWidgets);
	
	var currenturl = self.solr_baseURL();
	
	// Inicializamos el manager
	Manager = new AjaxSolr.Manager({
		solrUrl: currenturl
	});
	
	/** If autocomplete field changes, do a new Request so we have data for autocomplete purposes */
	self.autocomplete_fieldname.subscribe(function (newValue) {
		Manager.doRequest();
	});		
	
	
	Manager.addWidget(new AjaxSolr.ResultWidget({
		id: 'result',
		target: ''
	}));
	
	Manager.addWidget(new AjaxSolr.PagerWidget({
		id: 'pager',
		target: '#pager',
		prevLabel: '&lt;',
		nextLabel: '&gt;',
		innerWindow: 1,
		renderHeader: function (perPage, offset, total) {
			$('#pager-header').html($('<span/>').text('Viendo resultados del ' + Math.min(total, offset + 1) + ' al ' + Math.min(total, offset + perPage) + ' de un total de ' + total));
		}
	}));
	
	/*
		Manager.addWidget(new AjaxSolr.DropDownParamWidget({
		id: 'sort',
		param: 'sort',
		target: 'select.sort'
		}));
		Manager.addWidget(new AjaxSolr.CurrentSearchWidget({
		id: 'currentsearch',
		target: '#currentselection',
		}));
	*/
	
	Manager.addWidget(new AjaxSolr.AutocompleteWidget({
		id: 'text',
		target: '#search',
		fields: ['name']
	}));
	
	Manager.init();
	Manager.store.addByValue('q', '*:*');
	
	mostrarWidgets();	
	
};


// Termina el modelo 
}


/** Add params to solr query so we can fill tagcloud widgets */
function mostrarWidgets(){
	var widgets = vm.activeWidgets();
	var fields = [];
	
	for(var i=0;i<widgets.length;i++) {
		
		if(widgets[i].type()=="tagcloud"){
			fields.push(widgets[i].field());
		}
	}
	
	var params = {
		facet: true,
		'facet.field': fields,
		'facet.limit': 20,
		'facet.sort': 'count',
		'facet.mincount': 1,
		'json.nl': 'map'
	};
	
	for (var name in params) {
		Manager.store.addByValue(name, params[name]);
	}
	
	Manager.doRequest();
	
}

/** Load static graph widgets (sgvizler) */
function loadSgvizler(){
	var widgets = vm.activeWidgets();
	
	for(var i=0;i<widgets.length;i++) {
		
		if(widgets[i].type()=="sgvizler"){
			vm.activeWidgets()[i].value('<div id="'+widgets[i].id()+'_sgvizler" data-sgvizler-endpoint="'+ vm.sparql_baseURL() +'"?" data-sgvizler-query="'+widgets[i].query()+'" data-sgvizler-chart="gPieChart" data-sgvizler-loglevel="0" data-sgvizler-chart-options="is3D=true|title=Number of instances" style="width:300px; height:200px; background:#fff; display:inline;"></div>');
		}
	}
	
}

/** Save configuration */
function saveConfiguration(refreshpage){
	
	configuration.endpoints.serverURL = serverURL;
	configuration.template.pageTitle = vm.pageTitle();
	configuration.template.logoPath = vm.logoPath();
	configuration.template.language = vm.selectedLanguage();
	configuration.other.available_languages = vm.languages();
	configuration.results = ko.mapping.toJS(vm.resultsWidget);
	configuration.results.resultsLayout = ko.mapping.toJS(vm.resultsLayout());
	
	configuration.widgets = ko.toJS(vm.activeWidgets);
	
	var data = JSON.stringify(configuration).replace(/"/g,"\"").replace(/,/g,"\\,");
	//alert(JSON.stringify([data]));
	//console.log(JSON.stringify([data]));
	
	$.ajax({
		type:"POST",
		url: "http://shannon.gsi.dit.upm.es/episteme/lmf/config/data/search.config." + coreSelected,
		data:JSON.stringify([data]),
		contentType:"application/json; charset=utf-8",
		dataType:"json",
		success: function(data){
			
			if(refreshpage){
				window.location.reload();
				}else{
				$.blockUI.defaults.growlCSS.top = '30px'; 
				$.growlUI('¡Configuración guardada!', ''); 	
			}
			
			// http://jquery.malsup.com/block/#options
		},
		error: function() {
			alert("Error al guardar la configuración");
		}
	});
}

/** Update solr query when a tag is clicked (depending on its state) */
function updateSolrFilter() {
	// Borramos todos los filtros previos
	Manager.store.remove('fq');
	
	var tempString = "";
	var i = 0;
	$.each(vm.activeWidgets(), function(index1, item1) {
		i = 0;
		tempString = "";
		var catParent = item1.field();
		$.each(item1.values(), function(index2, item2) {
			if(item2.state() == true){
				if(i==0){
					tempString += catParent + ':"' + item2.name() + '"';
					i++;
				}else{
					tempString += ' OR ' + catParent + ':"' + item2.name() + '"';
				}
			}
		});
		Manager.store.addByValue('fq', tempString);
	});
	Manager.doRequest();
}

function HtmlEncode(s){
	var el = document.createElement("div");
	el.innerText = el.textContent = s;
	s = el.innerHTML;
	return s;
}

function isBlank(str) {
	return (!str || /^\s*$/.test(str));
}

function countElement(item,array) {
	var count = 0;
	$.each(array, function(i,v) { if (v === item) count++; });
	return count;
}

ko.utils.stringStartsWith = function(string, startsWith) {
	string = string || "";
	
	if (startsWith.length > string.length) return false;
	return string.substring(0, startsWith.length) === startsWith;
};

//extend the observableArray object

ko.observableArray.fn.sortByPropertyAsc = function(prop) {
	
	this.sort(function(obj1, obj2) {
		
		if(obj1[prop]!=undefined && obj2[prop]!=undefined){
			//console.log("Distinto de undefined");
			if (obj1[prop]().toString().toLowerCase() == obj2[prop]().toString().toLowerCase())
			return 0;
			else if (obj1[prop]().toString().toLowerCase() < obj2[prop]().toString().toLowerCase())
			return -1;
			else
			return 1;
			}else{
			//console.log("Undefined");
			return 1;	
		}
	});
}

ko.utils.stringContains = function(string, contain) {
	string = string.toLowerCase();
	contain = contain.toLowerCase().replace(/^\s\s*/, '').replace(/\s\s*$/, '').split(" ").join("|");
	string = string || "";
	//if (contain.length > string.length) return false;
	var regex = new RegExp(""+contain+"");
	//console.log(contain);
	return string.search(regex) !== -1
};   

ko.observableArray.fn.sortByPropertyCat = function(prop) {
	this.sort(function(obj1, obj2) {
		if (obj1[prop]() == obj2[prop]())
		return 0;
		else if (obj1[prop]() < obj2[prop]())
		return -1;
		else
		return 1;
	});
}   

function createMap(){    
	var elevator;
	var myOptions = {
		zoom: 3,
		center: new google.maps.LatLng(40.24, -3.41),
		mapTypeId: 'terrain'
	};
	map = new google.maps.Map($('#map')[0], myOptions);
}

function removeMapMarkers(){
	for (var i = 0; i < markers.length; i++) {
		var marker = markers[i];
		marker.setMap(null);
	}
	
	markers = [];  
}

ko.bindingHandlers.map = {
	init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
		var position = new google.maps.LatLng(allBindingsAccessor().latitude, allBindingsAccessor().longitude);
		
		var marker = new google.maps.Marker({ 
			map: allBindingsAccessor().map,
			position: position,
			title: allBindingsAccessor().title.toString()
		});
		
		markers.push(marker);
		viewModel._mapMarker = marker;
	},
	update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
		var latlng = new google.maps.LatLng(allBindingsAccessor().latitude, allBindingsAccessor().longitude);
		//console.log("UPDATE EN: " + allBindingsAccessor().latitude);
		viewModel._mapMarker.setPosition(latlng);
		
	}
};


ko.bindingHandlers.sortable = {
	init: function (element, valueAccessor) {
		// cached vars for sorting events
		var startIndex = -1,
		koArray = valueAccessor();
		
		var sortableSetup = {
			// cache the item index when the dragging starts
			start: function (event, ui) {
				startIndex = ui.item.index();
				
				// set the height of the placeholder when sorting
				ui.placeholder.height(ui.item.height());
			},
			// capture the item index at end of the dragging
			// then move the item
			stop: function (event, ui) {
				
				// get the new location item index
				var newIndex = ui.item.index();
				
				if (startIndex > -1) {
					//  get the item to be moved
					var item = koArray()[startIndex];
					
					//  remove the item
					koArray.remove(item);
					
					//  insert the item back in to the list
					koArray.splice(newIndex, 0, item);
					
					//  ko rebinds the array so we need to remove duplicate ui item
					ui.item.remove();
				}
				
			},
			placeholder: 'widget-placeholder',
			forcePlaceholderSize: true,
			revert: 300,
			delay: 100,
			opacity: 0.8
		};
		
		// bind
		$(element).sortable( sortableSetup );  
	}
};		

function slide(element) {
	console.log("SLIDE");
	$(element).hide().slideDown("slow","easeInBounce");
	
}	

ko.bindingHandlers.fadeVisible = {
	init: function(element, valueAccessor) {
		// Initially set the element to be instantly visible/hidden depending on the value
		var value = valueAccessor();
		$(element).toggle(ko.utils.unwrapObservable(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
	},
	update: function(element, valueAccessor) {
		// Whenever the value subsequently changes, slowly fade the element in or out
		var value = valueAccessor();
		ko.utils.unwrapObservable(value) ? $(element).slideDown() : $(element).slideUp();
	}
};


//control visibility, give element focus, and select the contents (in order)
ko.bindingHandlers.visibleAndSelect = {
	update: function(element, valueAccessor) {
		ko.bindingHandlers.visible.update(element, valueAccessor);
		if (valueAccessor()) {
			setTimeout(function() {
				$(element).focus().select();
			}, 0); 
		}
	}
}

var vm = new InitViewModel();

