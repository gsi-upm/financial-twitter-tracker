// Copyright (c) 2013 Roberto Bermejo, Marcos Torres, Grupo de Sistemas Inteligentes - Universidad Politécnica de Madrid. (GSI-UPM)
//  http://www.gsi.dit.upm.es/
//
//  All rights reserved. This program and the accompanying materials
//  are made available under the terms of the GNU Public License v2.0
//  which accompanies this distribution, and is available at
//
//  http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
//
//  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and  limitations under the License.

/** YOU MUST EDIT THIS LINE */
var serverURL = "http://demos.gsi.dit.upm.es/tomcat6/lmf-231/";
//var serverURL = "http://shannon.gsi.dit.upm.es/episteme/lmf/";
//var serverURL = "http://minsky.gsi.dit.upm.es/episteme/tomcat/LMF/";
	
var mode_ftt = true;

var i_layoutresultsextra = 0;
var limit_items_tagcloud = 40;

var Manager;

var coreSelected;

var firstTime = true;
var drawCharts = false;
var autocompleteSOLR = [];

var minSliderValue = "";
var maxSliderValue = "";

var templateWidgetsLeft = [];
var templateWidgetsRight = [];
var templateWidgetsLeftTab1 = [];
var templateWidgetsRightTab1 = [];

var errorinroute = false;
var sparqlmode = false;

var configuration = default_configuration;

function InitViewModel() {

	var self = this;

	/** Endpoint variables */
	self.serverURL = ko.observable(serverURL);
	self.solr_baseURL = ko.observable();
	self.sparql_baseURL = ko.observable();
	self.core = ko.observable();
	self.listCores = ko.observableArray();

	/** Template variables */
	self.pageTitle = ko.observable(configuration.template.pageTitle);
	self.logoPath = ko.observable();
	self.showTwitterWidget = ko.observable(true);
	self.showConfigurationPanel = ko.observable(configuration.template.showResultsWidget);
	self.showResultsWidget = ko.observable(false);
	self.showResultsGraphsWidget = ko.observable(false);
	self.showResultsGraphsWidgetConfiguration = ko.observable(false);
	self.openNewWidgetManager = ko.observable(false);
	self.openSgvizlerManager = ko.observable(false);
	self.showSparqlPanel = ko.observable(false);
	self.resultsWidget = ko.mapping.fromJS(configuration.results);
	self.resultsWidgetLayout = ko.observable("vertical");
	self.anyActiveFilter = ko.observable(false);
	self.numberOfActiveFilters = ko.observable();
	self.editingTitle = ko.observable();

	self.filter2 = ko.observable();

	self.activeTab = ko.observable(0);

	// Load sgvizler widgets everytime the activeTab is the second one.
	self.activeTab.subscribe(function(newValue) {
		if (newValue == 1) {
			self.loadSgvizler()
		}
	})
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
	self.dbpedia = ko.observable(false);
	self.sparql = ko.observable(false);

	/** All data */
	self.testData = [];
	self.shownData = ko.mapping.fromJS(self.testData);
	self.viewData = ko.mapping.fromJS(self.testData);
	self.resultsLayout = ko.mapping.fromJS(self.testData);
	self.autoCompleteFields = ko.mapping.fromJS(self.testData);
	self.autoCompleteFieldsSOLR = ko.mapping.fromJS(self.testData);
	self.autocomplete_fieldname = ko.observable(configuration.autocomplete.field);
	self.activedAutocomplete = ko.observable(configuration.autocomplete.actived);

	self.default_autocomplete_fieldname = ko.observable(configuration.autocomplete.field);

	/** Text in search field */
	self.filter = ko.observable();
	self.sparqlQuery = ko.observable();

	/** Type of field what we are searching for (i.e: province) */
	self.filterType = ko.observable();

	/** Filtered Data with activeWidgets */
	self.filteredDataClone = ko.observableArray();
	self.filteredCategory = ko.observableArray();

	/** Extra plugins */
	//self.currentTweets = ko.observableArray([]);
	self.sgvizlerQuery = ko.observable("SELECT ?o WHERE { ?s ?p ?o}");
	self.sgvizlerGraphType = ko.observable();

	/** New Widget fields */
	self.newTagCloudValue = ko.observable();
	self.newNumericFilterValue = ko.observable();
	self.newNumericFilterValidation = ko.observable(false);
	self.newPanelBarValue = ko.observable();
	self.newTwitterValue = ko.observable();
	self.newPieChartValue = ko.observable();
	self.newBarChartValue = ko.observable();
	self.newBarChartD3Value = ko.observable();
	self.fieldSelected = ko.observable();

	/* NEW WIDGETS */
	self.newWidgets = ko.observableArray([]);
	// widgetX defined in sefarad.html through the widget's update
	for (var i = 0; i < widgetX.length; i++) {
		self.newWidgets.push(widgetX[i])
	}

	/** Sortable widgets */
	self.sortableWidgets = ko.observable(configuration.sortable_widgets.actived);

	/**Number of data requested in each request  (LOCAL ONLY) */
	self.num_rows = ko.observable(10);

	/**Subscribe to changes in num_rows*/        
    self.num_rows.subscribe(function (newValue) {
        if(!sparqlmode){
            showWidgets();
        }
    });

	/**Number of data shown (LOCAL ONLY) */
	self.num_shown = ko.observable(10);

	self.num_shown.subscribe(function (newValue) {
		if(!sparqlmode){
			showWidgets();
		}
		
	});	

	/** TagCloudWidgets related */
	self.widgetContent = ko.observableArray();

	self.updating = ko.observable(false);

	self.numberOfResults = ko.observable();
	self.maxNumberOfResults = ko.observable();

	self.resultsGraphs = ko.mapping.fromJS(self.testData);

	/** Administrator */
	self.userName = ko.observable("");
	self.userPassword = ko.observable("");
	self.securityEnabled = ko.observable(true);
	self.adminMode = ko.observable(false);

	self.activeWidgetsLeft = ko.observableArray([]);
	self.activeWidgetsLeftTab1 = ko.observableArray([]);
	self.activeWidgetsRight = ko.observableArray([]);
	self.activeWidgetsRightTab1 = ko.observableArray([]);
	self.activeWidgets = ko.mapping.fromJS(self.testData);
	self.deleteAllFilters = ko.observable(false);


	/** Category of each widget */
	self.widgetCategory = function (cat){
		// text-filter
		if(cat == 1){
			return "box cat1";
		}

		// numeric-filter
		else if(cat == 2){
			return "box cat2";
		}

		// graph
		else if(cat == 3){
			return "box cat3";
		}

		// results
		else if(cat == 5){
			return "box cat5";
		}

		// map
		else if(cat == 6){
			return "box cat6";
		}

		// other
		else{
			return "box cat4";
		}

	}

	/** Layout functions */
	self.isotope = ko.observable();
	self.sortByName = function () {
		self.isotope({
			sortBy: 'name'
		});
	};

	self.serviceAdded = function (el) {
		if (el && el.nodeType === 1) {
			$('#contenedorr').isotope('appended', $(el), function () {
				$('#contenedorr').isotope('reLayout');
				self.isotope({
					sortBy: 'name'
				});
			});
		}
	};

	self.animateResultsChange = function () {
		$('.resultado').hide();
		$('.resultado').fadeIn(850);
	};
	self.animateTagsChange = function () {
		$('.activetag').hide();
		$('.activetag').fadeIn(300);
	};

	self.getTagcloudItem = function (name, count) {
		return name + " (" + count + ")";
	};

	/** Returns all data given a field (i.e type: province returns [facet: "Madrid", count: "5"]...)  */
	ko.utils.getDataColumns = function (type) {
		/** Local mode */
		if (self.sparql()) {
			var response = [];
			var results = ko.utils.arrayMap(self.filteredData(), function (item) {

				if (item[type] != undefined) {
					if (self.sparql()) {
						return item[type].value();
					} else {
						return item[type]()[0];
					}
				}
			});

			var different = ko.utils.arrayGetDistinctValues(results).sort();

			for (var i in different) {
				var count = countElement(different[i], results);
				response.push({
					facet: different[i],
					count: count
				});
			}

			return response;

		} else {

			if (Manager.response.facet_counts.facet_fields[type] === undefined) {
				return undefined;
			}

			var maxCount = 0;
			var objectedItems = [];

			for (var facet in Manager.response.facet_counts.facet_fields[type]) {

				var count = parseInt(Manager.response.facet_counts.facet_fields[type][facet]);
				if (count > maxCount) {
					maxCount = count;
				}

				objectedItems.push({
					facet: facet,
					count: count
				});
			}

			return objectedItems;
		}
	};

	/** This function populate all tagcloud widgets content */
	function updateWidgets(updateAll) {
		if (updateAll) {

			$.each(self.activeWidgets(), function (index, item) {
				if (item.type() == "tagcloud") {
					self.widgetContent(ko.utils.getDataColumns(item.field()));
					populateWidgets(index);
				}
			});

		} else {

			$.each(self.activeWidgetsLeft(), function (index, item) {

				if (item.type() == "tagcloud" && ko.utils.getDataColumns(item.field()) != undefined) {
					self.widgetContent(ko.utils.getDataColumns(item.field()));

					$.each(item.values(), function (id, it) {
						it.count('0');
					});

					$.each(self.widgetContent(), function (index2, item2) {
						$.each(item.values(), function (id, it) {
							if (it.name() == item2.facet) {
								self.activeWidgetsLeft()[index].values()[id].count(self.widgetContent()[index2].count);
							}
						});

					});
				}

			});

			$.each(self.activeWidgetsRight(), function (index, item) {

				if (item.type() == "tagcloud" && ko.utils.getDataColumns(item.field()) != undefined) {
					self.widgetContent(ko.utils.getDataColumns(item.field()));

					$.each(item.values(), function (id, it) {
						it.count('0');
					});

					$.each(self.widgetContent(), function (index2, item2) {
						$.each(item.values(), function (id, it) {
							if (it.name() == item2.facet) {
								self.activeWidgetsRight()[index].values()[id].count(self.widgetContent()[index2].count);
							}
						});

					});
				}

			});

		}
	};

	/** each value is a tag:
		id: 0
		name: Madrid
		state: false/true (depending on if we clicked on it or not)
	 */
	function populateWidgets(pIndex) {
		var parent = self.activeWidgets()[pIndex];
		var countIndex = 0;

		self.updating(true);

		console.log("POPULATE WIDGETS");
		console.log(vm.activeWidgets()[0].values())

		// parent.values.removeAll();
		// console.log(parent.values)
		// $.each(self.widgetContent(), function (index, item) {
		// 	parent.values.push({
		// 		"id": ko.observable(countIndex++),
		// 		"name": ko.observable(self.widgetContent()[index].facet),
		// 		"state": ko.observable(false),
		// 		"count": ko.observable(self.widgetContent()[index].count)
		// 	});
		// });

		if (parent.values == []) {
			$.each(self.widgetContent(), function (index, item) {
				parent.values.push({
					"id": ko.observable(countIndex++),
					"name": ko.observable(self.widgetContent()[index].facet),
					"state": ko.observable(false),
					"count": ko.observable(self.widgetContent()[index].count)
				});
			});
		} else {
			var nameValue = {}
			for (var i = 0; i < parent.values().length; i++) {
				nameValue[parent.values()[i].name()] = parent.values()[i].state()
			}
			// console.log(nameValue);

			parent.values.removeAll();

			$.each(self.widgetContent(), function (index, item) {
				var state = nameValue[self.widgetContent()[index].facet]
				// console.log(state);
				parent.values.push({
					"id": ko.observable(countIndex++),
					"name": ko.observable(self.widgetContent()[index].facet),
					"state": ko.observable(state),
					"count": ko.observable(self.widgetContent()[index].count)
				});
			});
		}

		parent.values.sortByPropertyCat('id');
		self.updating(false);
	}

	self.findMatchWidget = function (idwidget, type, item) {
		if (item != undefined) {
			if (item.id() == idwidget) {
				if (item.type() == "tagcloud") {
					$.each(item.values(), function (index, value) {
						if (value.state()) {
							hasFilters = true;
						}
					});
				}
				return true;
			}
		}
		return false;
	}

	/** This function deletes a widget */
	self.deleteWidget = function (idwidget, type) {
		var hasFilters = false;

		ko.utils.arrayFilter(self.activeWidgetsLeft(), function (item) {
			if (self.findMatchWidget(idwidget, type, item)) {
				self.activeWidgetsLeft.remove(item);
			}
		});

		ko.utils.arrayFilter(self.activeWidgetsRight(), function (item) {
			if (self.findMatchWidget(idwidget, type, item)) {
				self.activeWidgetsRight.remove(item);
			}
		});

		ko.utils.arrayFilter(self.activeWidgetsLeftTab1(), function (item) {
			if (self.findMatchWidget(idwidget, type, item)) {
				self.activeWidgetsLeftTab1.remove(item);
			}
		});

		ko.utils.arrayFilter(self.activeWidgetsRightTab1(), function (item) {
			if (self.findMatchWidget(idwidget, type, item)) {
				self.activeWidgetsRightTab1.remove(item);
			}
		});

		if (type == "resultswidget") {
			self.showResultsGraphsWidget(false);
			$.each(self.resultsGraphs(), function (index, item) {
				if (item.state()) {
					item.state(!item.state());
				}
			});
		}

		if (hasFilters || type == "slider") {
			updateSolrFilter();
		}
	};

	/** Switch Tagcloud layout */
	self.switchLayout = function (item) {
		var id = item.id();
		var changeTo = "";
		var found = false;

		if (item.layout() == "vertical") {
			changeTo = "horizontal";
		} else {
			changeTo = "vertical";
		}

		$.each(self.activeWidgetsLeft(), function (index, i) {
			if (id == i.id()) {
				found = true;
				self.activeWidgetsLeft.replace(self.activeWidgetsLeft()[index], {
					title: ko.observable(item.title()),
					collapsed: ko.observable(item.collapsed()),
					field: ko.observable(item.field()),
					id: ko.observable(item.id()),
					type: ko.observable(item.type()),
					values: ko.observableArray(item.values()),
					showWidgetConfiguration: ko.observable(item.showWidgetConfiguration()),
					layout: ko.observable(changeTo)
				});
			}
		});

		if (!found) {
			$.each(self.activeWidgetsRight(), function (index, i) {
				if (id == i.id()) {
					found = true;
					self.activeWidgetsRight.replace(self.activeWidgetsRight()[index], {
						title: ko.observable(item.title()),
						collapsed: ko.observable(item.collapsed()),
						field: ko.observable(item.field()),
						id: ko.observable(item.id()),
						type: ko.observable(item.type()),
						values: ko.observableArray(item.values()),
						showWidgetConfiguration: ko.observable(item.showWidgetConfiguration()),
						layout: ko.observable(changeTo)
					});
				}
			});
		}

	};

	/** Collapse a given widget */
	self.collapseWidget = function () {
		var val = this.collapsed();
		this.collapsed(!val);
	};

	/** When a tag in TagCloud widget is clicked we switch its state */
	self.tagCloudSelection = function (pIndex, index, field) {

		var parent_match = ko.utils.arrayFilter(self.activeWidgets(), function (item) {
			if (item.id() == pIndex) {
				return item;
			}
		});

		var parent = parent_match[0];

		var temp = !parent.values()[index()].state();
		var count = parent.values()[index()].count();

		parent.values.remove(function (item) {
			return item.name() == field;
		});

		parent.values.push({
			"id": index,
			"name": ko.observable(field),
			"state": ko.observable(temp),
			"count": ko.observable(count)
		});

		parent.values.sortByPropertyCat('id');

		if (!self.sparql()) {
			updateSolrFilter();
		} else {
			//updateWidgets(false);
		}
	};

	/** Language related functions */
	self.languages = ko.computed(function () {
		var response = new Array();
		for (var i = 0, l = languages.length; i < l; i++) {
			response.push(languages[i].lang);
		}
		return response;
	});

	self.selectedLanguageIndex = ko.dependentObservable(function () {
		return self.languages().indexOf(self.selectedLanguage());
	}, self);

	/** Subscribe to changes on language's select */
	self.selectedLanguage.subscribe(function (newValue) {
		var idx = self.selectedLanguageIndex();

		if (idx > -1) {
			self.lang(languages[parseInt(idx)]);
		} else {}

	});

	/** Reindex SOLR button */
	self.reindexSOLR = function () {
		$.ajax({
			type: "POST",
			url: self.serverURL() + "solr/cores/reinit",
			success: function (data) {

				$.blockUI.defaults.growlCSS.top = '30px';
				$.growlUI('Reindexación realizada con éxito', '');

			},
			error: function () {
				alert("Error al reindexar");
			}
		});
	};

	/** Add a custom graph given a sparql query */
	self.addSgvizlerWidget = function (title) {
		var id = Math.floor(Math.random() * 10001);
		var query = self.sgvizlerQuery();
		var typeOfGraph = self.sgvizlerGraphType();

		self.activeWidgetsRightTab1.push({
			"id": ko.observable(id),
			"title": ko.observable(title),
			"type": ko.observable("sgvizler"),
			"query": self.sgvizlerQuery,
			"collapsed": ko.observable(false),
			"value": self.sgvizlerGraphType,
			"showWidgetHelp": ko.observable(false),
			"help_en": 'Help',
			"help_es": "Ayuda"
		});

		var stringid = id.toString();
		mySgvizlerQuery(query, stringid, typeOfGraph);

		lang_onchange()

	};

	/** This computed function gets fields contained in a certain response from any sparql/solr query (i.e: province, name, type...) */
	self.dataColumns = ko.computed(function () {
		var mapping = _.map(self.viewData(), function (element) {
			return Object.keys(element);
		});
		var flat = _.reduce(mapping, function (a, b) {
			return a.concat(b);
		}, []);
		var unique = _.uniq(flat);

		return unique;
	});

	/** When "sort by" select option changes, sort viewData (only supported in sparql mode) */
	self.sortBy.subscribe(function (newValue) {

		if (newValue != undefined) {
			if (self.sparql()) {
				self.viewData.sortByPropertyAsc(newValue);

			} else {
				//Manager.store.addByValue('sort', newValue + ' asc');
				//Manager.doRequest();
			}
		}
	});

	/** This function does a mapping from json (response) to self.viewData and updateWidgets */
	self.getResultsSPARQL = function (sparql_query, endpoint) {

		if (isBlank(sparql_query)) {
			var queryText = self.sparqlQuery();
		} else {
			var queryText = sparql_query;
		}

		if (isBlank(endpoint)) {
			var endpoint = self.sparql_baseURL();
		}

		var finalQuery = queryText;

		if (self.dbpedia()) {
			queryText = queryText.replace(/\s/g, "_");
			var queryResource = "<http://dbpedia.org/resource/" + queryText + ">";
			finalQuery = "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>PREFIX dbo: <http://dbpedia.org/ontology/>PREFIX dbpprop: <http://dbpedia.org/property/>PREFIX foaf: <http://xmlns.com/foaf/0.1/> SELECT DISTINCT ?label ?abstract ?nationality ?birthDate ?photo WHERE {" + queryResource + " rdfs:label ?label .OPTIONAL {" + queryResource + " dbo:abstract ?abstract .}OPTIONAL {" + queryResource + " foaf:page ?page .}OPTIONAL {" + queryResource + " dbpprop:nationality ?nationality .}OPTIONAL {" + queryResource + " dbpprop:birthPlace ?birthPlace .}OPTIONAL {" + queryResource + " dbpprop:birthDate ?birthDate .}OPTIONAL {" + queryResource + " dbo:thumbnail ?photo .}FILTER (LANG(?label) = 'es')FILTER (LANG(?abstract) = 'es')}";
			endpoint = "http://dbpedia.org/sparql";
		}

		finalQuery = encodeURIComponent(finalQuery);
		finalQuery = decodeURIComponent(finalQuery);

		var lmf_sparql_baseURL = self.serverURL() + 'sparql/select';

		if (endpoint == lmf_sparql_baseURL && finalQuery != 'undefined') {

			$.ajax({
				type: 'GET',
				url: endpoint,
				data: {
					query: finalQuery,
					output: 'json'
				},
				beforeSend: function () {
					//$('#loading').show();
				},
				complete: function () {
					//$('#loading').hide();
				},
				success: function (allData) {
					//console.log(allData);
					var data = JSON.stringify(allData.results.bindings);
					//////console.log(data);
					ko.mapping.fromJSON(data, self.viewData);
					updateWidgets(true);
				},
				error: function () {
					//$('#docs').append("Consulta fallida");  
				}
			});

		} else if (finalQuery != 'undefined') {
			
			$.ajax({
				type: 'GET',
				url: endpoint,
				data: {
					query: finalQuery,
					output: 'json',
					format: 'json',
					debug: 'on',
					timeout: '0'
				},
				crossDomain: true,
				dataType: 'jsonp',
				beforeSend: function () {
					//$('#loading').show();
				},
				complete: function () {
					//$('#loading').hide();
				},
				success: function (allData) {
					//console.log(allData);
					var data = JSON.stringify(allData.results.bindings);
					//console.log(data);
					ko.mapping.fromJSON(data, self.viewData);
					updateWidgets(true);
				},
				error: function () {
					//$('#docs').append("Consulta fallida");  
				}
			});

		}

	};

	self.doDeleteAllFilters = function () {
		if (self.sparql()) {
			updateWidgets(true);
		} else {
			Manager.store.remove('fq');
			Manager.doRequest();
			firstTime = true;
		}
	};

	/** Authentication methods */

	self.doLogin = function () {

		$.ajax({
			type: "GET",
			url: self.serverURL() + "user/login",
			data: {
				logout: 'false',
				user: self.userName()
			},
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', make_base_auth(self.userName(), self.userPassword()));
			},
			success: function (data) {

			},
			error: function (data) {

				if (data.status == '401') {
					alert("Contraseña incorrecta");
					// window.location.reload();
				} else {
					// setCookie("user",make_base_auth(self.userName(), self.userPassword()),1);
					self.adminMode(true);
					self.userName("");
					self.userPassword("");	
					// loadCore();			
				}
			}
		});

	};

	self.checkLogin = function () {

		$.ajax({
			type: "GET",
			url: self.serverURL() + "user/login",

			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', self.getCookie("user"));
			},
			success: function (data) {

			},
			error: function (data) {

				if (data.status == '401') {
					console.log("CheckLogin Fail");
					// alert("Contraseña incorrecta");
					// window.location.reload();
					return false;
				} else {
					self.adminMode(true);
					console.log("CheckLogin OK");
					return true;
				}
			}
		});

	};


	function whois() {
			$.ajax({
				type: "GET",
				url: "http://localhost:8080/LMF/user/me",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', make_base_auth('admin2', 'pass2'));
				},
				success: function (data) {
					console.log(data);
					alert("Eres " + data.login);
				},
				error: function (data) {
					console.log(data);
				}
			});
		}

	function setCookie(c_name, value, exdays) {
		var exdate = new Date();
		exdate.setDate(exdate.getDate() + exdays);
		var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
		document.cookie = c_name + "=" + c_value;
		console.log(c_value);
	}

	self.getCookie = function (c_name) {
		var i, x, y, ARRcookies = document.cookie.split(";");
		for (i = 0; i < ARRcookies.length; i++) {
			x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
			y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
			x = x.replace(/^\s+|\s+$/g, "");
			if (x == c_name) {
				return unescape(y);
			}
		}
	}

	/** Filter results and get only different ones (ideal for sparql mode where there could be repeated results with a multivalued field) */
	self.uniqueItems = ko.computed(function () {
		if (self.sparql()) {

			var filteredArray = [];
			var i;
			$.each(self.viewData(), function (index, item) {

				var alreadyAdded = false;
				for (i in filteredArray) {
					if (item[self.resultsLayout()[0].Value()] != undefined && filteredArray[i][self.resultsLayout()[0].Value()] != undefined) {
						if (filteredArray[i][self.resultsLayout()[0].Value()].value() == item[self.resultsLayout()[0].Value()].value()) {
							alreadyAdded = true;
						}
					}
				}

				if (!alreadyAdded) {
					filteredArray.push(item);
				}
			});
			return filteredArray;
		} else {
			return self.viewData();
		}
	}, self);

	var dummyObservable = ko.observable();

	/** Filters the results widget using tags which state is true */
	self.filteredCategory = ko.computed(function () {

		var data = self.viewData();
		var filtro = self.activeWidgets();
		var active_filters = [];

		dummyObservable();

		if (!filtro) {

			return self.uniqueItems();
		} else {

			tempFilter = self.uniqueItems();

			$.each(self.activeWidgets(), function (index1, item1) {
				if (item1.type() == "tagcloud" && self.sparql()) {
					tempString = "";
					catParent = item1.field();

					$.each(item1.values(), function (index2, item2) {
						if (item2.state() == true) {
							tempString += " " + item2.name();
						}
					});

					tempFilter = ko.utils.arrayFilter(tempFilter, function (item) {
						if (item[catParent] != undefined) {
							if (tempString != "") {
								return ko.utils.stringContains(item[catParent].value().toString(), tempString);
							} else {
								return tempFilter;
							}

						}
					});

				}

				if (item1.type() == "slider" && self.sparql()) {
					catParent = item1.field();

					tempFilter = ko.utils.arrayFilter(tempFilter, function (item) {
						if (item[catParent] != undefined) {

							if (item[catParent].value() > item1.values()[0] && item[catParent].value() < item1.values()[1]) {
								return item;
							}

						}
					});

				}

			});
			// disposeWhen = function(){ return !self.updating(); }
			return tempFilter;
		}
	}, self);

	/** Final data visualized in results widget (after text filter through input if exists) */
	self.filteredData = ko.computed(function () {
		var data = self.filteredCategory();
		var array = [];

		/** Search box filter */
		var filter = self.filter();

		if (!filter) {
			return data;

		} else if (self.sparql()) {
			$.each(self.dataColumns(), function (id, field) {
				ko.utils.arrayFilter(data, function (item2) {

					if (item2[field] != undefined) {
						if (ko.utils.stringContains(item2[field].value(), filter)) {
							array.push(item2);
						}
					}
				});

			});
			return array;

		} else {
			return data;
		}

	}, self);	

	/** SPARQL Pager */
	self.offsetSPARQL = ko.observable(0);

	self.resultsSparqlText = ko.computed(function () {

		var total = self.filteredData().length;
		var offset = parseInt(self.offsetSPARQL());
		var perPage = parseInt(self.num_shown());

		return (self.lang().showingresults + Math.min(total, self.offsetSPARQL() + 1) + ' - ' + Math.min(total, (offset + perPage)) + ' (' + total + ' total)');
	
	});

	self.showMoreSPARQL = function () {
		console.log('---------------------- MORE SPARQL');
		var total = self.filteredData().length;
		var offset = parseInt(self.offsetSPARQL());
		var perPage = parseInt(self.num_shown());

		if ((offset+perPage) < total){
			self.offsetSPARQL((offset+perPage));
		}
	}

	self.showLessSPARQL = function() {
		var total = self.filteredData().length;
		var offset = parseInt(self.offsetSPARQL());
		var perPage = parseInt(self.num_shown());

		if ((offset-perPage) >0){
			self.offsetSPARQL((offset-perPage));
		}else{
			self.offsetSPARQL(0);
		}
	}

	self.sparqlPager = function() {
		var offset = self.offsetSPARQL();
		var shownArray = []
		for (var i = offset; i < offset + self.num_shown(); i++) {
			shownArray.push(self.filteredData()[i]);
		}
		self.shownData(shownArray);

		return self.num_shown();
	}

	/** Final data visualized in results widget (SPARQL MODE) */
	self.shownSparqlData = ko.computed(function () {
		
		var total = self.filteredData().length;
		var offset = parseInt(self.offsetSPARQL());
		var perPage = parseInt(self.num_shown());
		shownArray = new Array();

	    for (var i = offset; i < Math.min(total, (offset + perPage)); i++) {
	      shownArray.push(self.filteredData()[i]);
	    }
		
		return shownArray;
		
	}, self);

	self.shownSparqlDataClone = ko.observable();

	self.shownSparqlData.subscribe(function (newValue) {
		
		var editScript = ko.utils.compareArrays(self.shownSparqlData(), self.shownSparqlDataClone());

		self.shownSparqlDataClone(self.shownSparqlData());
		var hasChanged = false;

		for (var i = 0, j = editScript.length; i < j; i++) {
			switch (editScript[i].status) {
			case "retained":
				break;
			case "deleted":
				hasChanged = true;
				break;
			case "added":
				hasChanged = true;
				break;
			}
		}

		if (hasChanged) {

			updateWidgets(false);

			self.numberOfResults(self.filteredData().length);

			if (firstTime) {
				self.maxNumberOfResults(self.filteredData().length);
			}

			updateTwitterWidgets();
			self.redraw();
			self.drawcharts();

		}
	});
	
	self.invalidateIsNameValid = function () {
		dummyObservable.notifySubscribers(); //fake a change notification
	};

	/** If data shown in results widget changes, some graphic updates are needed */
	self.filteredData.subscribe(function (newValue) {

		var editScript = ko.utils.compareArrays(self.filteredData(), self.filteredDataClone());

		self.filteredDataClone(self.filteredData());
		var hasChanged = false;

		for (var i = 0, j = editScript.length; i < j; i++) {
			switch (editScript[i].status) {
			case "retained":
				break;
			case "deleted":
				hasChanged = true;
				break;
			case "added":
				hasChanged = true;
				break;
			}
		}

		if (hasChanged) {

			updateWidgets(false);

			if (self.sparql()) {
				self.numberOfResults(self.filteredData().length);
			}

			if (self.sparql() && firstTime) {
				self.maxNumberOfResults(self.filteredData().length);
			}

			updateTwitterWidgets();
			self.redraw();
			self.drawcharts();

		}

	});
	
	/** After every Manager.doRequest method we map the new results into viewData observable (SOLR ONLY) */
	self.update = function () {

		if(self.num_rows() != Manager.response.response.numFound){
			self.num_rows(Manager.response.response.numFound)
		}

		ko.mapping.fromJS(Manager.response.response.docs, self.viewData);

		self.numberOfResults(Manager.response.response.numFound);

		if (drawCharts) {
			vm.drawcharts();
			drawCharts = false;
		}

		if (firstTime) {
			self.maxNumberOfResults(Manager.response.response.numFound);

			updateWidgets(true);
			firstTime = false;
		} else {
			//updateWidgets(false);
		}

		// console.log($('.resultado').find('.info > p').html())
		// 	setTimeout(function () {
			// $('.resultado').each(function() {
			// 	if ($(this).find('.info > p').html() > 0) {
			// 		$(this).addClass('positive')
			// 	} else if ($(this).find('.info > p').html() < 0) {
			// 		$(this).addClass('negative');
			// 	}
			// })
		// }, 5000)


	};

	/** Draw chart widgets */
	self.drawcharts = function () {
		$.each(self.activeWidgets(), function (index, item) {
			if (item.type() == "piechart" || item.type() == "barchart") {
				paintHighChart(item.field(), item.id(), item.type());
			}

			for (var i = 0; i < widgetX.length; i++) {
				if (item.type() == widgetX[i].type) {
					// widgetX[i].paint(item.field(), item.id(), item.type());
					widgetX[i].paint(item.id());
				}
			}

		});

	};

	/** Draw charts in ResultsGraph widget */
	self.redraw = function () {
		$(".graphics").empty();
		$.each(self.resultsGraphs(), function (index, item) {

			if (item.state()) {
				$(".graphics").append("<div style='display: inline-block; width: 325px;' id='" + item.type() + "'></div>");
				paintHighChart(item.type(), item.type(), "barchart");
			}
		});
		if (mode_ftt) {
			addSentimentClass();
		}	
	};

	/** Show/hide configuration */
	self.showConfiguration = function () {
		var value = self.showConfigurationPanel();
		self.showConfigurationPanel(!value);
	};

	/** Tutorial */
	self.showHelp = function () {
		$('#TipContent').joyride({
			'scrollSpeed': 300, // Page scrolling speed in ms
			'timer': 0, // 0 = off, all other numbers = time(ms) 
			'startTimerOnClick': false, // true/false to start timer on first click
			'nextButton': true, // true/false for next button visibility
			'tipAnimation': 'fade', // 'pop' or 'fade' in each tip
			'pauseAfter': [], // array of indexes where to pause the tour after
			'tipAnimationFadeSpeed': 800, // if 'fade'- speed in ms of transition
			'cookieMonster': false, // true/false for whether cookies are used
			'cookieName': 'JoyRide', // choose your own cookie name
			'cookieDomain': false, // set to false or yoursite.com
		});
	};

	/** Openning wizards related */
	self.openNewWidgetManagerMethod = function () {
		initIsotopeAndWizards();
		self.openNewWidgetManager(true);
	};

	self.openSgvizlerManagerMethod = function () {
		initIsotopeAndWizards();
		self.openNewWidgetManager(false);
		self.openSgvizlerManager(true);
	};

	/** Widget's editing title function */
	self.editTitle = function (title) {
		self.editingTitle(title);
	};

	/** ADD WIDGETS METHODS */

	/** Results Widgets */
	self.addResultsVerticalWidget = function () {
		var id = Math.floor(Math.random() * 10001);

		self.activeWidgetsRight.push({
			"id": ko.observable(id),
			"title": ko.observable("Resultados"),
			"type": ko.observable("resultswidget"),
			"collapsed": ko.observable(false),
			"layout": ko.observable("vertical"),
			"showWidgetConfiguration": ko.observable(true)
		});
	};

	self.addResultsGridWidget = function () {
		var id = Math.floor(Math.random() * 10001);

		self.activeWidgetsRight.push({
			"id": ko.observable(id),
			"title": ko.observable("Resultados"),
			"type": ko.observable("resultswidget"),
			"collapsed": ko.observable(false),
			"layout": ko.observable("grid"),
			"showWidgetConfiguration": ko.observable(true)
		});
	};


	/** Adding a new PanelBar Widget */
	self.addPanelBarWidget = function () {

		var id = Math.floor(Math.random() * 10001);
		var field = self.newPanelBarValue();

		self.activeWidgetsLeft.push({
			"id": ko.observable(id),
			"title": ko.observable("Nuevo Panel Bar"),
			"type": ko.observable("tagcloud"),
			"field": ko.observable(self.newPanelBarValue()),
			"collapsed": ko.observable(false),
			"values": ko.observableArray(),
			"layout": ko.observable("vertical"),
			"showWidgetConfiguration": ko.observable(false)
		});

		if (self.sparql()) {
			updateWidgets(true);
		} else {

			var params = {
				facet: true,
				'facet.field': field,
				'facet.limit': limit_items_tagcloud,
				'facet.sort': 'count',
				'facet.mincount': 1,
				'json.nl': 'map',
				'rows': self.num_rows()
			};

			for (var name in params) {

				Manager.store.addByValue(name, params[name]);
			}
			
			Manager.store.remove('fq');
			Manager.doRequest();
			firstTime = true;
		}
	};

	/** Adding a new TagCloudWidget */
	self.addTagCloudWidget = function () {

		var id = Math.floor(Math.random() * 10001);
		var field = self.newTagCloudValue();

		if (self.activeTab() == 0) {
			self.activeWidgetsLeft.push({
				"id": ko.observable(id),
				"title": ko.observable("Nuevo TagCloud Widget"),
				"type": ko.observable("tagcloud"),
				"field": ko.observable(self.newTagCloudValue()),
				"collapsed": ko.observable(false),
				"values": ko.observableArray(),
				"layout": ko.observable("horizontal"),
				"showWidgetConfiguration": ko.observable(false)
			});

		} else {
			/** This tab is not being shown at the moment */
			//self.activeWidgetsLeftTab1.push({"id":ko.observable(id),"title": ko.observable("Nuevo Widget"), "type": ko.observable("tagcloud"), "field": ko.observable(self.newTagCloudValue()), "collapsed": ko.observable(false),"values":ko.observableArray(), "layout":ko.observable("horizontal"), "showWidgetConfiguration": ko.observable(false)});
		}

		if (self.sparql()) {
			updateWidgets(true);
		} else {
			var params = {
				facet: true,
				'facet.field': field,
				'facet.limit': limit_items_tagcloud,
				'facet.sort': 'count',
				'facet.mincount': 1,
				'json.nl': 'map',
				'rows': self.num_rows()
			};

			for (var name in params) {
				Manager.store.addByValue(name, params[name]);
			}

			Manager.store.remove('fq');
			Manager.doRequest();
			firstTime = true;
		}
	};

	/** Unused method but could be useful */
	function filterArrayByField(field) {

		var provinces = ko.utils.arrayMap(self.filteredData(), function (item) {
			if (item[field] != undefined) {
				return item[field].value();
			}
		});

		return ko.utils.arrayGetDistinctValues(provinces).sort();
	};

	self.newNumericFilterValue.subscribe(function (newValue) {
		// TO-DO: validación previa

		// Validación
		var regex = new RegExp("^[-+]?[0-9]*\.?[0-9]+$");

		if (!self.sparql()) {

			$.ajax({
				type: 'GET',
				url: self.solr_baseURL() + 'select?q=*%3A*&rows=0&stats=true&stats.field=' + newValue + '&indent=true&rows=0&wt=json',
				beforeSend: function () {
					self.newNumericFilterValidation(false);
				},
				complete: function () {},
				success: function (allData) {

					var data = JSON.parse(allData);
					var stats = data.stats.stats_fields[newValue];
					if (regex.exec(stats.min) != null) {
						minSliderValue = stats.min;
						maxSliderValue = stats.max;
						self.newNumericFilterValidation(true);
					} else {
						alert("Campo no válido");
					}

				},
				error: function () {}
			});

		} else {

			var test = filterArrayByField(newValue);

			// get min and max values in local
			minSliderValue = Math.min.apply(Math, test);
			maxSliderValue = Math.max.apply(Math, test);

			self.newNumericFilterValidation(true);

		}
	});

	/** Adding a new SliderWidget */
	self.addSliderWidget = function () {

		var id = Math.floor(Math.random() * 10001);
		var field = self.newNumericFilterValue();

		id_obs = ko.observable(id);
		field_obs = ko.observable(field);

		self.slider = ko.observable([]);

		self.slider().push(minSliderValue, maxSliderValue);

		var step = (maxSliderValue - minSliderValue) / 100;

		self.activeWidgetsLeft.push({
			"id": ko.observable(id),
			"title": ko.observable("Nuevo Slider"),
			"type": ko.observable("slider"),
			"field": ko.observable(self.newNumericFilterValue()),
			"collapsed": ko.observable(false),
			"value": ko.observable(step),
			"values": self.slider,
			"limits": ko.observable([minSliderValue, maxSliderValue]),
			"showWidgetHelp": ko.observable(false)
		});
	};

	/** Adding a new GaugeWidget */
	self.addGaugeWidget = function () {
		var id = Math.floor(Math.random() * 10001);

		self.activeWidgetsLeft.push({
			"id": ko.observable(id),
			"title": ko.observable("Nuevo Gauge"),
			"type": ko.observable("radialgauge"),
			"collapsed": ko.observable(false),
			"showWidgetHelp": ko.observable(false),
			"help": "Ayuda Gauge"
		});
		self.numberOfResults.valueHasMutated();
	};

	/** Adds a results stats widget */
	self.addResultStatsWidget = function () {
		var id = Math.floor(Math.random() * 10001);
		self.showResultsGraphsWidget(true);
		self.activeWidgetsLeft.push({
			"id": ko.observable(id),
			"title": ko.observable(self.lang().resultstats),
			"type": ko.observable("resultstats"),
			"collapsed": ko.observable(false),
			"showWidgetConfiguration": ko.observable(true),
			"showWidgetHelp": ko.observable(false)
		});
	};

	self.addTwitterWidget = function () {
		var id = Math.floor(Math.random() * 10001);
		var field = self.newTwitterValue();

		self.activeWidgetsLeft.push({
			"id": ko.observable(id),
			"title": ko.observable("Twitter"),
			"type": ko.observable("twitter"),
			"field": ko.observable(self.newTwitterValue()),
			"collapsed": ko.observable(false),
			"currentTweets": ko.observableArray([]),
			"showWidgetHelp": ko.observable(false)
		});

		updateTwitterWidget(field, id);

	};

	self.addPieChartWidget = function () {
		var id = Math.floor(Math.random() * 10001);
		var field = self.newPieChartValue();

		self.activeWidgetsLeft.push({
			"id": ko.observable(id),
			"title": ko.observable("Nuevo gráfico"),
			"type": ko.observable("piechart"),
			"field": ko.observable(self.newPieChartValue()),
			"collapsed": ko.observable(false),
			"showWidgetHelp": ko.observable(false)
		});

		paintHighChart(field, id, "piechart");
	};

	self.addBarChartWidget = function () {
		var id = Math.floor(Math.random() * 10001);
		var field = self.newBarChartValue();

		self.activeWidgetsLeft.push({
			"id": ko.observable(id),
			"title": ko.observable("Nuevo gráfico"),
			"type": ko.observable("barchart"),
			"field": ko.observable(self.newBarChartValue()),
			"collapsed": ko.observable(false),
			"showWidgetHelp": ko.observable(false)
		});

		paintHighChart(field, id, "barchart");
	};

	/** Load static graph widgets (sgvizler) */
	self.loadSgvizler = function () {

		$.each(self.activeWidgetsLeftTab1(), function (index, item) {
			if (item.type() == "sgvizler") {
				var id = item.id();
				var stringid = id.toString();

				mySgvizlerQuery(item.query(), stringid, item.value());
			}
		});

		$.each(self.activeWidgetsRightTab1(), function (index, item) {
			if (item.type() == "sgvizler") {
				var id = item.id();
				var stringid = id.toString();

				mySgvizlerQuery(item.query(), stringid, item.value());
			}
		});

	};

	function updateTwitterWidget(field, id) {
		var data = self.filteredData();
		var array = [];

		ko.utils.arrayFilter(self.filteredData(), function (item) {
			if (item[field] != undefined) {
				array.push(item[field]());
			}
		});

		ko.utils.arrayFilter(self.activeWidgets(), function (item) {
			if (item.id() == id) {
				twitterApi.getTweetsForUsers(array, item.currentTweets);
			}
		});

	};

	function updateTwitterWidgets() {
		$.each(self.activeWidgets(), function (index, item) {
			if (item.type() == "twitter") {
				updateTwitterWidget(item.field(), item.id());
			}
		});

	}

	/** Save button */
	self.doSave = function (user, pass) {
		saveConfiguration(false, user, pass);		
		self.showConfiguration();
	};

	/** Reset Configuration */
	self.resetConfiguration = function () {
		
		$.ajax({
			type: "POST",
			url: '/ftt/php/mongo_delete.php',

			beforeSend: function (xhr) {
					
			},
			success: function (data) {
				window.location.reload();
			},
			error: function () {
				alert("Error reseting configuration");	
			}
		});

	};

	/** Depending on the html route, redirect to a setup screen or directly to visualization screen */
	self.routes = function () {
		console.log('ROUTES')
		if (self.serverURL() == "") {
			self.page(4);
			errorinroute = true;

		} else {
			// Client-side routes    
			sammyPlugin = $.sammy(function () {
				this.bind('redirectEvent', function (e, data) {
					this.redirect(data['url_data']);
				});

				this.get('#/login', function (context) {

					console.log("LOGIN");
					self.page(10);					
					load('/login.html');
				});

				this.get('#/main', function (context) {
					window.location.href = 'http://demos.gsi.dit.upm.es/ftt/index.html#/main/ftt';
					console.log("ERROR EN RUTA");

					setupMethod();
					self.page(3);
					errorinroute = true;
				});

				this.get('#/main/:coreId/admin', function () {

					self.core(this.params.coreId);
					coreSelected = this.params.coreId;

					var solr_baseURL = serverURL + 'solr/' + coreSelected + '/';
					self.solr_baseURL(solr_baseURL);

					self.adminMode(true);

					/** Cargamos la configuración para el core dado */
					loadCore();
				});

				this.get('#/main/:coreId', function () {

					self.core(this.params.coreId);
					coreSelected = this.params.coreId;

					var solr_baseURL = serverURL + 'solr/' + coreSelected + '/';
					self.solr_baseURL(solr_baseURL);

					if (!self.securityEnabled()) {
						self.adminMode(true);
					} else {
						self.adminMode(false);
						self.showConfigurationPanel(false);
					}

					/** Cargamos la configuración para el core dado */
					loadCore();
				});

				this.get('#/sparql', function () {
					sparqlmode = true;
					self.sparql = ko.observable(true);
					self.sparql = ko.observable(true);
					self.showSparqlPanel = ko.observable(true);

					if (!self.securityEnabled()) {
						self.adminMode(true);
					} else {
						self.adminMode(false);
						self.showConfigurationPanel(false);
					}
					init();

				});

				this.get('#/sparql/kukinet', function () {
					sparqlmode = true;

					self.sparql = ko.observable(true);
					self.sparql = ko.observable(true);
					configuration.template.pageTitle = "KukiNet";
					configuration.template.logoPath = "https://lh4.ggpht.com/u5vxDMD5XpZQdnN8ZPVdU9rw1QCcD4VL1dgZ6OLw5jh8i9Bdz4aCDSCROMwTuk9YwOEM=w124";
					self.getResultsSPARQL("SELECT ?text ?score ?category ?delivered ?latitude ?longitude ?username ?userdescription ?usercountry ?uservoted ?userreceived ?userscore WHERE { ?s <http://www.kukinet.com/text> ?text ; <http://www.kukinet.com/score> ?score ; <http://www.kukinet.com/category> ?category ; <http://www.kukinet.com/delivered> ?delivered ; <http://www.kukinet.com/latitude> ?latitude ; <http://www.kukinet.com/longitude> ?longitude ; <http://www.kukinet.com/username> ?username ; <http://www.kukinet.com/userdescription> ?userdescription ; <http://www.kukinet.com/usercountry> ?usercountry ; <http://www.kukinet.com/uservoted> ?uservoted ; <http://www.kukinet.com/userreceived> ?userreceived ; <http://www.kukinet.com/userscore> ?userscore ; } LIMIT 100");
					configuration.results.resultsLayout = [{
						Name: "Títulos",
						Value: "text"
					}, {
						Name: "Subtítulo",
						Value: "username"
					}, {
						Name: "Descripción",
						Value: "score"
					}, {
						Name: "Logo",
						Value: ""
					}, ];
					configuration.template.language = "Español";
					templateWidgetsRight.push({
						id: 0,
						title: 'Categoría',
						type: 'tagcloud',
						field: 'category',
						collapsed: false,
						query: '',
						value: [],
						values: [],
						limits: '',
						layout: 'horizontal',
						showWidgetConfiguration: false,
						showWidgetHelp: false
					});
					templateWidgetsLeft.push({
						id: 1,
						title: 'País',
						type: 'tagcloud',
						field: 'usercountry',
						collapsed: false,
						query: '',
						value: [],
						values: [],
						limits: '',
						layout: 'vertical',
						showWidgetConfiguration: false,
						showWidgetHelp: false
					});
					templateWidgetsLeft.push({
						"id": 2,
						"title": "Gráfico",
						"type": "barchart",
						"field": 'category',
						"collapsed": ko.observable(false),
						"showWidgetHelp": ko.observable(false)
					});
					//templateWidgetsLeft.push({"id": 3,"title": "Mapa", "type": "map","collapsed": ko.observable(false)});
					templateWidgetsLeft.push({
						"id": 4,
						"title": "Gauge",
						"type": "radialgauge",
						"collapsed": ko.observable(false),
						"showWidgetHelp": ko.observable(false)
					});

					self.adminMode(true);

					init();
				});				

				this.get('#/graph/:coreId', function (context) {

				});

				                
                this.get('#/sparql/universitiesDemo', function () {
                    console.log("UNIVERSITIES DEMO");
                    self.sparql = ko.observable(true);
                    vm.getResultsSPARQL("select distinct ?university ?city ?country ?latitude ?longitude where { { ?universityresource <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/University> ; <http://dbpedia.org/ontology/country> ?countryresource ; <http://dbpedia.org/ontology/country> <http://dbpedia.org/resource/Spain> ; <http://dbpedia.org/ontology/city> ?cityresource ; <http://www.w3.org/2000/01/rdf-schema#label> ?university ; <http://www.w3.org/2003/01/geo/wgs84_pos#lat> ?latitude ; <http://www.w3.org/2003/01/geo/wgs84_pos#long> ?longitude . ?countryresource <http://www.w3.org/2000/01/rdf-schema#label> ?country . ?cityresource <http://www.w3.org/2000/01/rdf-schema#label> ?city } UNION { ?universityresource <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/University> ; <http://dbpedia.org/ontology/country> ?countryresource ; <http://dbpedia.org/ontology/country> <http://dbpedia.org/resource/France> ; <http://dbpedia.org/ontology/city> ?cityresource ; <http://www.w3.org/2000/01/rdf-schema#label> ?university ; <http://www.w3.org/2003/01/geo/wgs84_pos#lat> ?latitude ; <http://www.w3.org/2003/01/geo/wgs84_pos#long> ?longitude . ?countryresource <http://www.w3.org/2000/01/rdf-schema#label> ?country . ?cityresource <http://www.w3.org/2000/01/rdf-schema#label> ?city } FILTER ( lang(?university) = 'en' && lang(?country) = 'en' && lang(?city) = 'en') }", "http://dbpedia.org/sparql");
                    configuration.template.language = "English";
                    configuration.template.pageTitle = "Universities Demo";
                    configuration.results.resultsLayout = [{
                        Name: "Títulos",
                        Value: "university"
                    }, {
                        Name: "Subtítulo",
                        Value: "country"
                    }, {
                        Name: "Descripción",
                        Value: "city"
                    }, {
                        Name: "Logo",
                        Value: ""
                    }, ];
                    templateWidgetsLeft.push({
                        id: 0,
                        title: 'Countries',
                        type: 'tagcloud',
                        field: 'country',
                        collapsed: false,
                        query: '',
                        value: [],
                        values: [],
                        limits: '',
                        layout: 'horizontal',
                        showWidgetConfiguration: false,
						showWidgetHelp: false,
						help: 'Muestra los países en los que existen Universidades'
                    });
                    configuration.autocomplete.field = "university";
                    self.securityEnabled(false);
                    self.adminMode(true);
                    sparqlmode = true;
                    init();

                    //Adding widgets
                    $(window).load(function () {
                        //Add map widget
                        widgetMap.render();

                        // // Add results widget
                        self.activeWidgetsRight.push({
                            "id": ko.observable(0),
                            "title": ko.observable(self.lang().results),
                            "type": ko.observable("resultswidget"),
                            "collapsed": ko.observable(false),
                            "layout": ko.observable("vertical"),
                            "showWidgetConfiguration": ko.observable(false),
							"showWidgetHelp": ko.observable(false),
							"help": 'Muestra las Universidades filtradas'
                        });

                        // Add resultstats widget
                        self.addResultStatsWidget();

                        // Add PieChart sgvizler wigdet
                        self.sgvizlerQuery("SELECT ?university ?students WHERE{ ?universityresource <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/University> ; <http://dbpedia.org/ontology/country> ?countryresource ; <http://www.w3.org/2000/01/rdf-schema#label> ?university . ?countryresource <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/class/yago/EuropeanCountries> . ?universityresource <http://dbpedia.org/ontology/numberOfStudents> ?students FILTER ( lang(?university) = 'en') } GROUP BY ?university LIMIT 50");
                        self.sgvizlerGraphType('google.visualization.PieChart');
                        self.sparql_baseURL("http://dbpedia.org/sparql");
                        self.addSgvizlerWidget("Total students by University");

                        // Add Gauge Widget
                        var id = Math.floor(Math.random() * 10001);
                        self.activeWidgetsLeft.push({
                            "id": ko.observable(id),
                            "title": ko.observable("Total Universities"),
                            "type": ko.observable("radialgauge"),
                            "collapsed": ko.observable(false),
							"showWidgetHelp": ko.observable(false),
							"help": "Muestra el total de universidades filtradas."
                        });
                        self.numberOfResults.valueHasMutated();
                    });
                });

				this.notFound = function () {

					self.page(1);
					errorinroute = true;
				}
			}).run('#/main');
		}
	}

	/** Error window asking user to select a core */
	function setupMethod() {

		$.getJSON(self.serverURL() + 'solr/cores', function (data) {
			self.listCores(data);
		});

		self.start = function () {
			location.hash = '#/main/' + self.core();
			window.location.reload();
		}
	};

	/** If core exists, go to loadConfiguration method. Otherwise, show an error */
	function loadCore() {

		if(true){
			loadConfiguration();
		}else {
			$.ajax({
				type: "get",
				url: self.solr_baseURL() + "admin/luke?show=schema&wt=json",
				cache: false,
				dataType: 'json',
				success: function () {
					loadConfiguration();
				},
				error: function () {
					console.log("ERROR");
					self.page(2);
					errorinroute = true;
					setupMethod();
				}
			});
		}
	};

	/** Load configuration for a given core */
	function loadConfiguration() {
	    console.info("Estoy en loadConfiguration");
	    var loaded_configuration = "";

	        $.ajax({
	            type: 'get',
	            url: '/ftt/php/mongo_load.php',
	            dataType: "json",
	            success: function (data) {
	                console.log(data);

	                loaded_configuration = data;
	                configuration = loaded_configuration;

	                // templateWidgetsLeft = [];
	                // templateWidgetsRight = [];
	                // templateWidgetsLeftTab1 = [];
	                // templateWidgetsRightTab1 = [];

	                for (var i = 0; configuration.widgetsLeft.length > i; i++) {

	                    templateWidgetsLeft.push({
	                        id: configuration.widgetsLeft[i].id,
	                        title: configuration.widgetsLeft[i].title,
	                        type: configuration.widgetsLeft[i].type,
	                        field: configuration.widgetsLeft[i].field,
	                        collapsed: configuration.widgetsLeft[i].collapsed,
	                        query: configuration.widgetsLeft[i].query,
	                        value: configuration.widgetsLeft[i].value,
	                        values: configuration.widgetsLeft[i].values,
	                        limits: configuration.widgetsLeft[i].limits,
	                        layout: configuration.widgetsLeft[i].layout,
	                        currentTweets: configuration.widgetsLeft[i].currentTweets,
	                        showWidgetConfiguration: configuration.widgetsLeft[i].showWidgetConfiguration,
	                        showWidgetHelp: configuration.widgetsLeft[i].showWidgetHelp,
	                        help_es: configuration.widgetsLeft[i].help_es,
	                        help_en: configuration.widgetsLeft[i].help_en
	                    });
	                }

	                for (var i = 0; configuration.widgetsRight.length > i; i++) {

	                    templateWidgetsRight.push({
	                        id: configuration.widgetsRight[i].id,
	                        title: configuration.widgetsRight[i].title,
	                        type: configuration.widgetsRight[i].type,
	                        field: configuration.widgetsRight[i].field,
	                        collapsed: configuration.widgetsRight[i].collapsed,
	                        query: configuration.widgetsRight[i].query,
	                        value: configuration.widgetsRight[i].value,
	                        values: configuration.widgetsRight[i].values,
	                        limits: configuration.widgetsRight[i].limits,
	                        layout: configuration.widgetsRight[i].layout,
	                        currentTweets: configuration.widgetsRight[i].currentTweets,
	                        showWidgetConfiguration: configuration.widgetsRight[i].showWidgetConfiguration,
	                        showWidgetHelp: configuration.widgetsRight[i].showWidgetHelp,
	                        help_es: configuration.widgetsRight[i].help_es,
	                        help_en: configuration.widgetsRight[i].help_en
	                    });
	                }

	                for (var i = 0; configuration.widgetsLeftTab1.length > i; i++) {
	                    templateWidgetsLeftTab1.push({
	                        id: configuration.widgetsLeftTab1[i].id,
	                        title: configuration.widgetsLeftTab1[i].title,
	                        type: configuration.widgetsLeftTab1[i].type,
	                        field: configuration.widgetsLeftTab1[i].field,
	                        collapsed: configuration.widgetsLeftTab1[i].collapsed,
	                        query: configuration.widgetsLeftTab1[i].query,
	                        value: configuration.widgetsLeftTab1[i].value,
	                        values: configuration.widgetsLeftTab1[i].values,
	                        limits: configuration.widgetsLeftTab1[i].limits,
	                        layout: configuration.widgetsLeftTab1[i].layout,
	                        currentTweets: configuration.widgetsLeftTab1[i].currentTweets,
	                        showWidgetConfiguration: configuration.widgetsLeftTab1[i].showWidgetConfiguration,
	                        showWidgetHelp: configuration.widgetsLeftTab1[i].showWidgetHelp,
	                        help_es: configuration.widgetsLeftTab1[i].help_es,
	                        help_en: configuration.widgetsLeftTab1[i].help_en
	                    });
	                }

	                for (var i = 0; configuration.widgetsRightTab1.length > i; i++) {
	                    templateWidgetsRightTab1.push({
	                        id: configuration.widgetsRightTab1[i].id,
	                        title: configuration.widgetsRightTab1[i].title,
	                        type: configuration.widgetsRightTab1[i].type,
	                        field: configuration.widgetsRightTab1[i].field,
	                        collapsed: configuration.widgetsRightTab1[i].collapsed,
	                        query: configuration.widgetsRightTab1[i].query,
	                        value: configuration.widgetsRightTab1[i].value,
	                        values: configuration.widgetsRightTab1[i].values,
	                        limits: configuration.widgetsRightTab1[i].limits,
	                        layout: configuration.widgetsRightTab1[i].layout,
	                        currentTweets: configuration.widgetsRightTab1[i].currentTweets,
	                        showWidgetConfiguration: configuration.widgetsRightTab1[i].showWidgetConfiguration,
	                        showWidgetHelp: configuration.widgetsRightTab1[i].showWidgetHelp,
	                        help_es: configuration.widgetsRightTab1[i].help_es,
	                        help_en: configuration.widgetsRightTab1[i].help_en
	                    });
	                }

	                init();

	                updateSolrFilter();

	            },

	            error: function (data) {
	                templateWidgetsRight.push({
	                    "id": ko.observable(0),
	                    "title": ko.observable("Resultados"),
	                    "type": ko.observable("resultswidget"),
	                    "collapsed": ko.observable(false),
	                    "layout": ko.observable("vertical"),
	                    "showWidgetConfiguration": ko.observable(false)
	                });
	            }
	        });
	};

	function init() {

		self.page(0);

		/** Update values from loaded configuration */
		/** Endpoint variables */

		var sparql_baseURL = self.serverURL() + 'sparql/select';
		self.sparql_baseURL(sparql_baseURL);

		/** Overriding some template variables */
		self.pageTitle(configuration.template.pageTitle);
		self.logoPath(configuration.template.logoPath);
		self.showResultsWidget = ko.observable(configuration.template.showResultsWidget);
		self.resultsWidget = ko.mapping.fromJS(configuration.results);
		self.selectedLanguage(configuration.template.language);
		self.maxNumberOfResults(configuration.other.maxNumberOfResults);
		self.sortableWidgets(configuration.sortable_widgets.actived);
		self.autocomplete_fieldname(configuration.autocomplete.field);
		self.default_autocomplete_fieldname(configuration.autocomplete.field);
		self.activedAutocomplete = ko.observable(configuration.autocomplete.actived);
		//self.autocomplete_fieldname.valueHasMutated();
		//self.autocomplete_fieldname = ko.observable("name");
		self.activeWidgetsLeft = ko.mapping.fromJS(templateWidgetsLeft);
		self.activeWidgetsRight = ko.mapping.fromJS(templateWidgetsRight);
		self.activeWidgetsLeftTab1 = ko.mapping.fromJS(templateWidgetsLeftTab1);
		self.activeWidgetsRightTab1 = ko.mapping.fromJS(templateWidgetsRightTab1);
		self.filter('');
		//self.resultsGraphsTemp = ko.mapping.fromJS(self.testData);

		self.dataColumnsWithId = ko.computed(function () {
			var result = new Array;
			var i = 1;
			ko.utils.arrayFilter(self.dataColumns(), function (itm) {
				result.push({
					Id: i,
					Name: itm
				});
				i++;
			});

			return result;
		});

		self.getMaxNumberOfResults = ko.computed(function () {
			var max = self.maxNumberOfResults();

			return max;
		});

		self.getGaugeMajorUnits = ko.computed(function () {
			var max = self.maxNumberOfResults();
			var fmajorunits = max / 10;
			var majorunits = Math.floor(fmajorunits);

			return majorunits;
		});

		self.activeWidgets = ko.computed(function () {
			return self.activeWidgetsLeft().concat(self.activeWidgetsRight()).concat(self.activeWidgetsLeftTab1()).concat(self.activeWidgetsRightTab1());
		}, self);

		self.numberOfActiveFilters = ko.computed(function (numbers) {
			var activeFiltersCount = 0;
			
			ko.utils.arrayFilter(self.activeWidgets(), function (item1) {
				if (item1.type() == "tagcloud") {
					ko.utils.arrayFilter(item1.values(), function (item2) {
						if (item2.hasOwnProperty('state')) {
							if (item2.state() == true) {
								activeFiltersCount++;
							}
						} else {
							item2.state = ko.observable(false);
						}
						
					});
				}
			});

			if (activeFiltersCount > 1) {
				return true;
			} else {
				return false;
			}
		});

		self.anyActiveFilter = ko.computed(function (numbers) {
			var activeFiltersCount = 0;

			ko.utils.arrayFilter(self.activeWidgets(), function (item1) {
				if (item1.type() == "tagcloud") {
					ko.utils.arrayFilter(item1.values(), function (item2) {
						if (item2.hasOwnProperty('state')) {
							if (item2.state() == true) {
								activeFiltersCount++;
							}
						} else {
							item2.state = ko.observable(false);
						}
					});
				}
			});

			if (activeFiltersCount > 0) {
				return true;
			} else {
				return false;
			}
		});

		self.resultsLayout = ko.mapping.fromJS(configuration.results.resultsLayout);

		self.isotope({
			layoutMode: 'fitRows',
			itemSelector: '.result_box',
			animationEngine: 'best-available',
			getSortData: {
				name: function ($elem) {
					return $elem.find('.name').text();
				}
			}
		});

		/** Update Twitter widgets dinamically */
		/*
		setInterval(function (){
			twitterApi.getTweetsForUsers(self.twitterList(), self.currentTweets);
		}, 10000);			
		 */

		self.resultsGraphs = ko.computed(function () {
			var array = ko.utils.arrayMap(self.dataColumns(), function (item) {
				return {
					type: ko.observable(item),
					state: ko.observable(false)
				};
			});

			return array;
		});

		self.resultsGraphs.subscribe(function (newValue) {

			ko.utils.arrayFilter(self.resultsGraphs(), function (item) {
				item.state.subscribe(function () {
					self.redraw();
				});
			});

			// Se deja de actualizar resultsGraphs
			self.resultsGraphs.dispose();
		}, self);

		var widgets = self.activeWidgets();

		for (var i = 0; i < widgets.length; i++) {
			if (widgets[i].type() == "resultstats") {
				self.showResultsGraphsWidget(true);
			}
		}

		if (!sparqlmode) {
			// SOLR MODE

			var currenturl = self.solr_baseURL();

			// Inicializamos el manager
			Manager = new AjaxSolr.Manager({
				solrUrl: currenturl
			});

			/** If autocomplete field changes, do a new Request so we have data for autocomplete purposes */
			self.autocomplete_fieldname.subscribe(function (newValue) {
				var isActive = self.activedAutocomplete();

				if (isActive) {
					Manager.doRequest();
				}
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
					if (total != 0) {
						$('#pager-header').html($('<span/>').text(self.lang().showingresults + Math.min(total, offset + 1) + ' - ' + Math.min(total, (parseInt(offset) + parseInt(perPage))) + ' (' + total + ' total)'));
					} else {
						$('#pager-header').html($('<span/>').text(''));
					}
				}
			}));

			Manager.addWidget(new AjaxSolr.AutocompleteWidget({
				id: 'text',
				target: '.search'
			}));

			Manager.init();
			Manager.store.addByValue('q', '*:*');

			showWidgets();
			ko.applyBindings(vm);

			var widgets = self.activeWidgets();

		} else {

			// console.log(filteredData());

			/** Local MODE */
			if (self.showResultsWidget()){
				self.activeWidgetsRight.push({
				"id": ko.observable(0),
				"title": ko.observable(self.lang().results),
				"type": ko.observable("resultswidget"),
				"collapsed": ko.observable(false),
				"layout": ko.observable("vertical"),
				"showWidgetConfiguration": ko.observable(false)
				});
			}


			self.autoCompleteFields = ko.computed(function () {
				var isActive = self.activedAutocomplete();
				var array = [];

				if (self.filteredData().length != 0 && isActive) {

					ko.utils.arrayFilter(self.filteredData(), function (data) {

						if (data[self.autocomplete_fieldname()] != undefined) {
							array.push(data[self.autocomplete_fieldname()].value().toString());
						} else if (data[self.default_autocomplete_fieldname()] != undefined) {
							array.push(data[self.default_autocomplete_fieldname()].value().toString());
						}
					});

				}

				return array;
			}, self);

		}


	};

	// Ends vm	
}

/** Add params to solr query so we can fill tagcloud widgets */
function showWidgets() {
	var widgets = vm.activeWidgets();
	var fields = [];

	for (var i = 0; i < widgets.length; i++) {

		if (widgets[i].type() == "tagcloud") {
			fields.push(widgets[i].field());
		}
	}

	var params = {
		facet: true,
		'facet.field': fields,
		'facet.limit': limit_items_tagcloud,
		'facet.sort': 'count',
		'facet.mincount': 1,
		'json.nl': 'map',
		'rows': vm.num_rows()
	};

	for (var name in params) {
		Manager.store.addByValue(name, params[name]);
	}

	Manager.doRequest();

}

/** Save configuration method */
function saveConfiguration(refreshpage, user, pass) {

	//update configuration JSON
	configuration.name = "saved_configuration";
	configuration.endpoints.serverURL = serverURL;
	configuration.template.pageTitle = vm.pageTitle();
	configuration.template.logoPath = vm.logoPath();
	configuration.template.language = vm.selectedLanguage();
	configuration.other.available_languages = vm.languages();
	configuration.other.maxNumberOfResults = vm.maxNumberOfResults();
	configuration.results = ko.mapping.toJS(vm.resultsWidget);
	configuration.results.resultsLayout = ko.mapping.toJS(vm.resultsLayout());

	configuration.autocomplete.actived = vm.activedAutocomplete();
	if (!isBlank(vm.autocomplete_fieldname())) {
		configuration.autocomplete.field = vm.autocomplete_fieldname();
	} else {
		configuration.autocomplete.field = vm.default_autocomplete_fieldname();
	}

	configuration.sortable_widgets.actived = vm.sortableWidgets();

	configuration.widgetsLeft = ko.toJS(vm.activeWidgetsLeft);
	configuration.widgetsRight = ko.toJS(vm.activeWidgetsRight);
	configuration.widgetsLeftTab1 = ko.toJS(vm.activeWidgetsLeftTab1);
	configuration.widgetsRightTab1 = ko.toJS(vm.activeWidgetsRightTab1);

	for (var i = 0; i < vm.activeWidgets().length; i++) {

	}

	configuration.activeTagWidgets

	// for (var i = 0; i < configuration.widgetsRightTab1.length; i++) {
	// 	configuration.widgetsRightTab1[i].title = null;
	// }
	// for (var i = 0; i < configuration.widgetsLeftTab1.length; i++) {
	// 	configuration.widgetsLeftTab1[i].title = null;
	// }

	//save configuration JSON

	ac = JSON.stringify(configuration);
    
    $.ajax({
		type: "POST",
		url: '/ftt/php/mongo_save.php',
		data: {actual_configuration : ac},
		dataType: "json",
		beforeSend: function (xhr) {
				
		},
		success: function (data) {

			if (refreshpage) {
				window.location.reload();
			} else {
				$.blockUI.defaults.growlCSS.top = '20px';
				$.growlUI('¡Configuración guardada!', '');
			}
		},
		error: function () {
			alert("Error saving configuration");	
		}
	});

}

/** Update solr query when a tag is clicked (depending on its state) */
function updateSolrFilter() {	
	// Borramos todos los filtros previos
	Manager.store.remove('fq');

	var tempString = "";
	var sliderArray = [];

	var i = 0;
	// Hacemos AND para diferentes propiedades y OR para los que estén activos dentro de una misma propiedad
	// Por ejemplo: province:Madrid OR province:Barcelona AND type:Universidad
	$.each(vm.activeWidgets(), function (index1, item1) {
		i = 0;
		tempString = "";

		if (item1.field != undefined) {
			var catParent = item1.field();
		} else {}
		if (item1.type() == "tagcloud") {
			$.each(item1.values(), function (index2, item2) {
				if (item2.state() == true) {
					if (i == 0) {
						tempString += catParent + ':"' + item2.name() + '"';
						i++;
					} else {
						tempString += ' OR ' + catParent + ':"' + item2.name() + '"';
					}
				}
			});

			Manager.store.addByValue('fq', tempString);
		}

		// Preparación de los filtros tipo slider
		if (item1.type() == "slider") {
			var catParent = item1.field();

			var str = item1.values().toString();
			var n = str.replace(",", " TO ");

			sliderArray.push({
				'type': catParent,
				'filter': ':[' + n + ']'
			});

		}
	});

	var string = "";
	var usedType = [];

	// Para los filtros de tipo slider, si el tipo es el mismo aplicamos OR y si son distintos, AND
	for (var i = 0; i < sliderArray.length; i++) {
		if (i == 0) {
			usedType.push(sliderArray[i].type);
			string += sliderArray[i].type + sliderArray[i].filter;
		} else {
			var exists = false;
			for (var j = 0; j < usedType.length; j++) {
				if (sliderArray[i].type == usedType[j]) {
					string += ' OR ' + sliderArray[i].type + sliderArray[i].filter;
					exists = true;
				} else {
					exists = false;
				}
			}
			if (!exists) {
				string += ' AND ' + sliderArray[i].type + sliderArray[i].filter;
				usedType.push(sliderArray[i].type);
			}

		}
	}

	Manager.store.addByValue('fq', string);

	Manager.doRequest();
}

function HtmlEncode(s) {
	var el = document.createElement("div");
	el.innerText = el.textContent = s;
	s = el.innerHTML;
	return s;
}

function isBlank(str) {
	return (!str || /^\s*$/.test(str));
}

function countElement(item, array) {
	var count = 0;
	$.each(array, function (i, v) {
		if (v === item) count++;
	});
	return count;
}

ko.utils.stringStartsWith = function (string, startsWith) {
	string = string || "";

	if (startsWith.length > string.length) return false;
	return string.substring(0, startsWith.length) === startsWith;
};

//extend the observableArray object

ko.observableArray.fn.sortByPropertyAsc = function (prop) {

	this.sort(function (obj1, obj2) {
		if (obj1[prop] != undefined && obj2[prop] != undefined) {
			if (obj1[prop].value().toString().toLowerCase() == obj2[prop].value().toString().toLowerCase())
				return 0;
			else if (obj1[prop].value().toString().toLowerCase() < obj2[prop].value().toString().toLowerCase())
				return -1;
			else
				return 1;
		} else {
			return 1;
		}
	});
}

ko.utils.stringContains = function (string, contain) {
	string = string.toLowerCase();

	contain = contain.toLowerCase().replace(/^\s\s*/, '').replace(/\s\s*$/, '').split(" ").join("|");
	string = string || "";

	var regex = new RegExp("" + contain + "");
	return string.search(regex) !== -1
};

ko.observableArray.fn.sortByPropertyCat = function (prop) {
	this.sort(function (obj1, obj2) {
		if (obj1[prop]() == obj2[prop]())
			return 0;
		else if (obj1[prop]() < obj2[prop]())
			return -1;
		else
			return 1;
	});
};

function paintHighChart(field, id, typeofchart) {

	var t = ko.utils.getDataColumns(field);

	if (t == undefined) {
		var params = {
			facet: true,
			'facet.field': field,
			'facet.limit': limit_items_tagcloud,
			'facet.sort': 'count',
			'facet.mincount': 1,
			'json.nl': 'map',
			'rows': vm.num_rows()
		};

		for (var name in params) {
			Manager.store.addByValue(name, params[name]);
		}

		// If it is a new Widget, not results Widget.
		if (field != id) {
			drawCharts = true;
		}

		Manager.doRequest();

	} else {

		//var temp = [];
		var cat = [];
		var temp = [];

		if (typeofchart == "barchart") {

			for (var i = 0, l = t.length; i < l; i++) {
				cat.push(t[i].facet);
				temp.push(t[i].count);
			}

			var stringid = id.toString();

			var final_config = getBarChartConfig(stringid, field, cat, temp);
			new Highcharts.Chart(final_config);
		}

		if (typeofchart == "piechart") {

			for (var i = 0, l = t.length; i < l; i++) {
				temp.push([t[i].facet, t[i].count]);
			}

			var stringid = id.toString();

			var final_config = getPieChartConfig(stringid, field, temp);
			new Highcharts.Chart(final_config);
		}

	}
}

function make_base_auth(user, password) {
	var tok = user + ':' + password;
	var hash = btoa(tok);
	return "Basic " + hash;
}

//connect items with observableArrays
ko.bindingHandlers.sortableList = {
	init: function (element, valueAccessor, allBindingsAccessor, context) {
			$(element).data("sortList", valueAccessor()); //attach meta-data
			$(element).sortable();		
	},

	update: function (element, valueAccessor, allBindingsAccessor, context) {
		if (vm.sortableWidgets()) {
			$(element).data("sortList", valueAccessor()); //attach meta-data
			$(element).sortable("enable");	
			$(element).sortable({
				update: function (event, ui) {
					var item = ui.item.data("sortItem");
					////("ITEM ES:");
					////(item);
					if (item) {
						//identify parents
						var originalParent = ui.item.data("parentList");
						var tipo = ui.item.data("sortItem").type();
						if (ui.item.data("sortItem").query != undefined) {
							var query = ui.item.data("sortItem").query;
							var typeOfGraph = ui.item.data("sortItem").value;
						}
						var id = ui.item.data("sortItem").id();
						var newParent = ui.item.parent().data("sortList");
						////("Original parent es:");
						////(tipo);
						////(originalParent());
						////("New parent es:");
						////(newParent());
						//figure out its new position
						var position = ko.utils.arrayIndexOf(ui.item.parent().children(), ui.item[0]);
						////("posicion " + position);
						if (position >= 0) {
							originalParent.remove(item);
							newParent.splice(position, 0, item);
						}
						ui.item.remove();
						if (tipo == "resultstats") {
							vm.redraw();
						}
						if (tipo == "piechart" || tipo == "barchart") {
							vm.drawcharts();
						}
						if (tipo == "radialgauge") {
							vm.numberOfResults.valueHasMutated();
						}
						if (tipo == "sgvizler") {
							mySgvizlerQuery(query, id, typeOfGraph);
						}
						for (var i = 0; i < widgetX.length; i++) {
							vm.drawcharts();
						}
					}
				},
				connectWith: '.container',
				placeholder: 'widget-placeholder',
				forcePlaceholderSize: true,
				dropOnEmpty: true,
				revert: true,
				revertDuration: 150,
				delay: 150,
				distance: 30,
				opacity: 0.8
			});
		}else{
			$(element).data("sortList", valueAccessor()); //attach meta-data
			$(element).sortable("disable");
		}
	}
};

//attach meta-data
ko.bindingHandlers.sortableItem = {
	init: function (element, valueAccessor) {
		var options = valueAccessor();
		$(element).data("sortItem", options.item);
		$(element).data("parentList", options.parentList);
	}
};

ko.bindingHandlers.ko_autocomplete = {
	init: function (element, params) {
		$(element).autocomplete(params());
	},
	update: function (element, params) {
		$(element).autocomplete("option", "source", params().source);
	}
};

function slide(element) {
	$(element).hide().slideDown("slow", "easeInBounce");

}

ko.bindingHandlers.slider = {
	init: function (element, valueAccessor, allBindingsAccessor) {
		var options = allBindingsAccessor().sliderOptions || {};
		var observable = valueAccessor().values;

		if (observable().splice) {
			options.range = true;
		}

		options.slide = function (e, ui) {
			observable(ui.values);
		};

		ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
			$(element).slider("destroy");
		});

		options.stop = function (event, ui) {
			$(element).slider("values", ui.values);

			vm.invalidateIsNameValid();

			if (!vm.sparql()) {
				updateSolrFilter();
			}
		};
		$(element).slider(options);
	},
	update: function (element, valueAccessor) {
		var value = ko.utils.unwrapObservable(valueAccessor().values);
		$(element).slider("values", value);

	}
};

ko.bindingHandlers.fadeVisible = {
	init: function (element, valueAccessor) {
		// Initially set the element to be instantly visible/hidden depending on the value
		var value = valueAccessor();
		$(element).toggle(ko.utils.unwrapObservable(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
	},
	update: function (element, valueAccessor) {
		// Whenever the value subsequently changes, slowly fade the element in or out
		var value = valueAccessor();
		ko.utils.unwrapObservable(value) ? $(element).slideDown() : $(element).slideUp();
	}
};

ko.bindingHandlers['jqIsotope'] = {
	'update': function (element, valueAccessor, allBindingsAccessor, viewModel) {
		var options = ko.utils.unwrapObservable(valueAccessor());
		if (options) {
			if (Object.prototype.toString.call(options) === '[object Array]') {
				$.fn.isotope.apply($(element), options);
			} else {
				$(element).isotope(options);
			}
		}
	}
};

//control visibility, give element focus, and select the contents (in order)
ko.bindingHandlers.visibleAndSelect = {
	update: function (element, valueAccessor) {
		ko.bindingHandlers.visible.update(element, valueAccessor);
		if (valueAccessor()) {
			setTimeout(function () {
				$(element).focus().select();
			}, 0);
		}
	}
}

function aa (datatable) {
	console.log('exito')
	console.log(datatable)
}
function bb (datatable){
	console.log('fallo')
}

function mySgvizlerQuery(query, id, type) {

	// console.log(query)

	// Q = new sgvizler.Query()

	// Q.query(queryy)
	// 	.endpoint(vm.sparql_baseURL())
	// 	.getDataTable(aa, bb);

	sgvizler
		.defaultEndpointURL(vm.sparql_baseURL())
		.prefix('npdv', 'http://sws.ifi.uio.no/vocab/npd#')
		.defaultQuery(query)
		.defaultChartFunction(type)

	$("#" + id).append('<div id="' + id + '" data-sgvizler-query="' + query + '" data-sgvizler-log="0"></div>');
	sgvizler.containerDraw(id);
}

function sparqlPanel() {
	if ($("#sparqlQueryPanel").is(":hidden")) {
		$("#sparqlQueryPanel").slideDown("slow");
		$("#backgroundPopup").css({
			"opacity": "0.7"
		});
		$("#backgroundPopup").fadeIn("slow");
	} else {
		$("#sparqlQueryPanel").slideUp("slow");
		$("#backgroundPopup").fadeOut("slow");
	}
};

function addSentimentClass() {
	setTimeout(function() {
		$('.resultado').each(function() {
			// console.log($(this).find('.info > p').html())
			if ($(this).find('.info > p').html() > 0.5) {
				$(this).addClass('resultado_positivo')
			} else if ($(this).find('.info > p').html() < 0.5) {
				$(this).addClass('resultado_negativo');
			}
		});
	}, 5);
}

var lang_onchange = function () {
	// console.log('onchaaaaange');
	if ($('#lang').val() == "Español") {
		$('.help_en').hide();
		$('.help_es').show();
	}

	if ($('#lang').val() == "English") {
		$('.help_en').show();
		$('.help_es').hide();
	}
}

$('#lang').change(lang_onchange);


var vm = new InitViewModel();