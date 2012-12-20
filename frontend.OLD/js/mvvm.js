	// TO-DO
	var core = "ftt1";
	var map;
	var i_layoutresultsextra = 0;



 /*
var resultsLayout = [
{
    Name: "Título",
    Value: ko.observable("")},
{
    Name: "Subtítulo",
    Value: ko.observable("")},
{
    Name: "Descripción",
    Value: ko.observable("")},
{
    Name: "Logo",
    Value: ko.observable("")},
];
*/
	var Manager;
	var semantic_option_fields;
	var widget_semantic_fields;

	var markers = [];

function Widget(name, content) {
    var self = this;
    self.name = ko.observable(name);
    self.content = ko.observable(content);

/*
    self.formattedPrice = ko.computed(function() {
        var price = self.meal().price;
        return price ? "$" + price.toFixed(2) : "None";        
    });    
*/
}

function ResultsListViewModel() {
	var self = this;
	self.widgetsActivos = ko.observableArray([]);
	self.baseURL = ko.observable();
	self.sparql_baseURL = ko.observable();
	self.pageTitle = ko.observable();
	self.logoPath = ko.observable();

	self.sortBy = ko.observable();
	self.filter = ko.observable();
	self.filterType = ko.observable();
	self.filterArray = ko.observableArray();

	self.filterCategory = ko.observable();
	self.filteredCategory = ko.observableArray();
	
	self.lightmode = ko.observable(configuration.other.lightmode);
	self.autocomplete_fieldname = ko.observable(configuration.autocomplete.field);

	self.sparql = ko.observable(false);
	self.showResultsWidget = ko.observable(true);
	console.log("MOSTRAR MAPA: " + configuration.other.showMap);
	self.showMapWidget = ko.observable(configuration.other.showMap);
	self.isOpen = ko.observable(false);

	self.resultsLayout = ko.observableArray(configuration.results.resultsLayout);
	self.results2Layout = ko.observableArray();
	self.semantic_fields = ko.observableArray();
	
	self.currentTweets = ko.observableArray([]);

	self.mapLat = ko.observable(configuration.mapWidget.latitude);
	self.mapLong = ko.observable(configuration.mapWidget.longitude);
	
	self.resLayout = ko.observableArray(
		ko.utils.arrayFilter(self.resultsLayout(), function(item) {
		console.log(item);
		return ko.observable(item);
  }));
	self.test = ko.observableArray(["name", "province"]);
  self.testData = [];
  self.viewData = ko.mapping.fromJS(self.testData);

  // para pestañas
	self.page = ko.observable(0);
	self.languages = ko.observableArray(configuration.other.available_languages);
	self.selectedLanguage = ko.observable(configuration.other.default_language);
	self.selectedLanguage.subscribe(function (newValue) {
		if(newValue!=undefined && newValue.localeCompare("Español")==0){
				$("[data-localize]").localize("lang", { language: "es" });
			}else{
				$("[data-localize]").localize("lang", { language: "en" });
			}
	});
  self.tagclouditems = ko.observableArray(ko.utils.arrayMap([], function(contact) {
    return { type: contact.type, values: ko.observableArray(contact.values) };
  }));
	self.logs = function() {
		$(".footer").append("<div id='dynamic'><p data-bind='text: pageTitle'></p><div class='pruebaa'></div></div>");
	    	ko.applyBindings(vm, document.getElementById("dynamic"));

	      	Manager.addWidget(new AjaxSolr.TagcloudWidget({
	        	id: "pruebaaa",
	        	target: '.pruebaa',
	        	field: 'province',
		}));
	};
	
	self.addSgvizlerWidget = function() {
		console.log("boton clicado sgvizler");
		graphWidgetWizard();
	};	
	
  self.dataColumns = ko.computed(function() {
    var mapping = _.map(self.viewData(), function(element){ return Object.keys(element); });
	  //console.log("Mapping: " + mapping);
    var flat = _.reduce(mapping, function(a,b){return a.concat(b); }, [] );
		var unique = _.uniq(flat);
    return unique;
  });
	
		self.sortBy.subscribe(function (newValue) {
			if(newValue!=undefined && self.lightmode()){
				console.log("sortBy Nuevo valor: " + newValue);
				self.viewData.sortByPropertyAsc(newValue);
				ko.utils.arrayFilter(self.viewData(), function(itm) {
					//console.log("Datos es: " + itm[newValue]());
				});				
			}
		});		
		
		self.lightmode.subscribe(function (newValue) {
			console.log("lightmode Nuevo valor: " + newValue);
			self.filter("");
			self.filterCategory("");
			Manager.doRequest();
		});
		
		self.sparql.subscribe(function (newValue) {
			console.log("sparql newValue: " + newValue);
			self.filter("");

			$("#results_sparql").empty();
			//Manager.doRequest();
		});			
		
		self.listArray = function(field){
			console.log("Sacamos provincias de filteredData " + field);
			
			var provinces = ko.utils.arrayMap(self.filteredData(), function(item) {
				if(item[field]!=undefined) {
					return item[field]()[0];
				}
			});
			
			console.log(ko.utils.arrayGetDistinctValues(provinces).sort());
			return ko.utils.arrayGetDistinctValues(provinces).sort();
			
		};
		
	self.filterData = function (field,value){
		console.log("Campo es: " + field);
		console.log("Value es: " + value);		
		self.filterType(field);
		self.filterCategory(value);
		
	};
	
	self.resetFilterCategory = function (){
		self.filterCategory("");
	};

	self.editResultsLayout = function (){
		self.isOpen(true);
	};
		
	self.filteredCategory = ko.computed(function() {
		var data = self.viewData();
		var filterType = self.filterType();
		var filterCategory = self.filterCategory();
		
		if(!filterCategory){
			return data;  
		}else{
			return ko.utils.arrayFilter(self.viewData(), function(item) {
				if(item[filterType]!=undefined) {
					//console.log(item[filterType]().toString());
					return ko.utils.stringStartsWith(item[filterType]().toString(), filterCategory);
				}
			});
		}		
	},self);
	
	self.filteredData = ko.computed(function() {  
		console.log("computing filteredData");
		var data = self.filteredCategory();

		var filter = self.filter();
		var filterType = "name";
		if(!self.sparql()){
			if(!filter){
				return data;  
			}else{
				return ko.utils.arrayFilter(data, function(item) {
					if(item[filterType]!=undefined) {
						//console.log(item[filterType]().toString());
						return ko.utils.stringStartsWith(item[filterType]().toString(), filter);
					}
				});
			}
		
		}else{
			getResultsSPARQL(filter);
		}
	},self);	

	
	self.autoComplete = ko.computed(function() {
	if(!isBlank(self.autocomplete_fieldname())){
		var data = self.filteredData();
		var ac_fieldname = self.autocomplete_fieldname();
		console.log("ac_fieldname es: " + ac_fieldname);

		return ko.utils.arrayMap(data, function(item) {
			if(item[ac_fieldname]!=undefined) {
				//console.log(item.name());
				return item[ac_fieldname]().toString();
			}
		});
	}else{
		return "";
	}
	},self);

		self.autocomplete_fieldname.subscribe(function (newValue) {
			console.log("Nuevo valor: " + newValue);
			Manager.doRequest();
			
		});		
	
	/*
	self.twitterList = ko.computed(function() {
		var data = self.filteredData();

		return ko.utils.arrayFilter(data, function(item) {
			if(item.name!=undefined) {
				//console.log(item.name().toString());
				return item.name();
			}
		});
	},self);
*/
	//self.twitterList = ko.observableArray(["INDRA Software Labs", "ALTRAN"]);
   	//ko.computed(function() {
        //	twitterApi.getTweetsForUsers(self.twitterList(), self.currentTweets);
    	//}, self);


	
	$('#configuration').hide();

	// Cargamos la configuración para el core
	loadConfiguration(core);


	// Comportamiento para mostrar/ocultar la configuración general
	self.configure = function() {
		//console.log("Response docs: " + Manager.response.response.docs);
		//ko.mapping.fromJS(Manager.response.response.docs, self.viewData);
		//console.log('The length of the Data is ' + self.viewData().length);
                console.log("Titulo: " + self.pageTitle());
               if ($('#configuration').is(":hidden"))
               {
                    $('#configuration').slideDown("slow");
               } else {
                    $('#configuration').slideUp("slow");
               }

	};
	
	self.update = function() {
		console.log("Actualizamos array visible");
		ko.mapping.fromJS(Manager.response.response.docs, self.viewData);
		
		
		
	};
	
	self.updateTagCloud = function() {
		
	};

	self.addWidget = function() {
		console.log("boton clicado");
  		iNettuts.addWidget("#column0tab0", {
			id: Math.floor(Math.random() * 10001),
    			color: "color-blue",			
    			title: "Nuevo widget",
			type: "tagcloud"
  		})		
	};



	self.doSave = function() {
		iNettuts.saveAllPreferences();
		//saveConfiguration(core, self.baseURL());	
	};

        // Carga la configuración para un Core dado
        function loadConfiguration(core) {
	        $.ajax({
                   url:"http://shannon.gsi.dit.upm.es/episteme/lmf/config/data/search.config."+core,
                   success: function(data){
                   	configuration = JSON.parse(data['search.config.'+core]);
                   	console.log("Carga con éxito");
	           	var data = JSON.stringify(configuration).replace(/"/g,"\"").replace(/,/g,"\\,");
	           	//alert(JSON.stringify([data]));
			console.log(JSON.stringify([data]));

			for (var i = 0; configuration.widgets.length > i; i++) {	
				self.widgetsActivos().push({ name: configuration.widgets[i].name, field: configuration.widgets[i].field , id: configuration.widgets[i].id, color: configuration.widgets[i].color, type: configuration.widgets[i].type, collapsed: configuration.widgets[i].collapsed, col: configuration.widgets[i].col, query: configuration.widgets[i].query});
			}

			//var resultados = ko.toJS(configuration.results.resultsLayout);
			var data = ["HOLA", "ADIOS"];
			ko.mapping.fromJS(data, self.results2Layout());

		ko.utils.arrayFilter(self.results2Layout(), function(itm) {
			console.log("resultsLayout " + itm);
		});
			//nsole.log("CONFIG CARGADO: " + self.resultsLayout()[3].Value);

			//self.resultsLayout().push({title: configuration.results.title, subtitle: configuration.results.subtitle, link: configuration.results.link, description: configuration.results.description, image: configuration.results.image});
			
//self.resultsLayout().push([configuration.results.title], [configuration.results.subtitle], [configuration.results.link], [configuration.results.description], [configuration.results.image]);
			//var titulosaved = configuration.results.title;
			//console.log("Titulo saved: " + titulosaved);
			
			
			
			//for (var i = 0; configuration.results.extra.length > i; i++) {	
			//	self.layoutResultsExtraItems().push(configuration.results.extra[i]);
				//console.log("EXTRA: " + self.layoutResultsExtraItems()[i]);
			//}

	widget_semantic_fields = '<select class="widget_field">';
	// Primer valor vacío
	semantic_option_fields = '<option></option>';

	// Cargamos los semantic_fields
	$.getJSON(configuration.baseURL + "admin/luke?show=schema&wt=json",function(data){                    
                    for (var field in data.schema.fields) {
                        //semantic_fields.push({name:field, value:data.schema.fields[field]});
			semantic_option_fields += '<option value="'+field+'">'+ field+'</option>';                
			widget_semantic_fields += '<option value="'+field+'">'+ field+'</option>';
			//if(data.schema.fields[field].type=='rgbColor') color=true;
		   	//console.log("FIELDS: " + field);
					
			// VALOR BUENO
			self.semantic_fields.push(field);
               	    }

			widget_semantic_fields += '</select></li>';
		//console.log("Widget semantic fields: " + widget_semantic_fields);
			
			init();
			//return widget_semantic_fields;
              });
                   },
                    error: function() {
			widget_semantic_fields = '<select class="widget_field"></select>'
			console.log("Error al cargar la configuración");
                        init();
			
                    }
                });
           };

function init(){
	// URL cargada	
	self.baseURL(configuration.baseURL);
	self.pageTitle(configuration.layout.pageTitle);
	self.logoPath(configuration.layout.logoPath);
	self.sparql_baseURL(configuration.sparql_baseURL);
	self.selectedLanguage(configuration.language);
	//self.autocomplete_fieldname(configuration.autocomplete.field);
  // Widget de resultados
	/*
   	iNettuts.addWidget("#column1tab0", {
		id: "0",
   		color: configuration.results.wcolor,			
   		title: configuration.results.wtitle,
		type: configuration.results.wtype,
		collapsed: configuration.results.wcollapsed,
		content: "Personaliza tu contenido " + i
   	})
   	*/

	var currentVal = self.baseURL();
	console.log("SOLR URL: " + currentVal);

	// Inicializamos el manager
  Manager = new AjaxSolr.Manager({
    solrUrl: currentVal
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

  var widgets = self.widgetsActivos();

  var fields = [];
  for(var i=0;i<widgets.length;i++) {
    fields.push(widgets[i].field);
  }

  for (var i = 0, l = fields.length; i < l; i++) {
		// Le añadimos un f al final    
		var target = widgets[i].id + 'f';
    Manager.addWidget(new AjaxSolr.TagcloudWidget({
	    id: i,
	    target: '#' + target,
	    field: fields[i],
	 	}));
  }

/*
    Manager.addWidget(new AjaxSolr.DropDownParamWidget({
      id: 'sort',
      param: 'sort',
      target: 'select.sort'
    }));
*/
	Manager.addWidget(new AjaxSolr.CurrentSearchWidget({
		id: 'currentsearch',
  		target: '#currentselection',
	}));

// TO DO
/*
	Manager.addWidget(new AjaxSolr.TextWidget({
  		id: 'text',
  		target: '#search'
  		//fields: ['name', 'province']
	}));
*/


	Manager.addWidget(new AjaxSolr.AutocompleteWidget({
	  id: 'text',
	  target: '#search',
	  fields: ['name']
	}));

    Manager.init();
    Manager.store.addByValue('q', '*:*');

    //Manager.store.addByValue('fq', 'type:"Pequeña y mediana empresa" OR type:"Universidad" OR type:"Otros"');


    var params = {
      facet: true,
      'facet.field': fields,
      'facet.limit': 10,
      'facet.sort': 'count',
      'facet.mincount': 1,
      'json.nl': 'map'
    };

    for (var name in params) {
      Manager.store.addByValue(name, params[name]);
    }
    
    Manager.doRequest();
	
    mostrarWidgets();
	
// Client-side routes    
sammyPlugin = $.sammy(function() {
		this.bind('redirectEvent', function(e, data) {
       	        this.redirect(data['url_data']);
    	});

        this.get('#/main', function(context) {
			self.page(0);
		});

		this.get('#/graph', function(context) {
			
			$("#column0tab1").empty();
			$("#column1tab1").empty();
		for (var i = 0, l = self.tagclouditems().length; i < l; i++) {
			console.log("i es: " + i);
			
			var iden = Math.floor(Math.random() * 10001);
			iNettuts.addWidget("#column0tab1", {
				id: iden,
    			color: "color-blue",			
    			title: "Nuevo gráfico",
				type: "sgvizler_auto",
			})
			
			//console.log("Data es: " + self.tagclouditems()[i].values);

			//tagclouditems es:
			// {type: "province", values: { [Madrid,0], [Barcelona,5], [Sevilla, 4]...} }
			
			var data = ko.toJS(self.tagclouditems()[i].values());
			var graph = google.visualization.arrayToDataTable(data);

			// Create and draw the visualization.
		
			new google.visualization.PieChart(document.getElementById(iden+'f')).draw(graph, {title:"Ejemplo"});	
		}			
			
			self.page(1);
		});
		
}).run('#/main'); 	
			
}


function mostrarWidgets(){  
   
    var widgets = self.widgetsActivos();

	// Widgets que añadimos dinámicamente
    for (var i = 0; widgets.length > i; i++) {

    	iNettuts.addWidget("#" + widgets[i].col, {
		id: widgets[i].id,
    	color: widgets[i].color,			
    	title: widgets[i].name,
		field: widgets[i].field,
		type: widgets[i].type,
		collapsed: widgets[i].collapsed,
		query: HtmlEncode(widgets[i].query),
		content: "Personaliza tu contenido " + i
    	})
    }


}

}

// Guardar configuración tras pulsar el botón correspondiente
function saveConfiguration(core,refreshpage){
	console.log("sparql BASEURL ES: " + vm.baseURL());
		configuration.baseURL = vm.baseURL();
		configuration.sparql_baseURL = vm.sparql_baseURL();
		configuration.layout.pageTitle = vm.pageTitle();
		configuration.layout.logoPath = vm.logoPath();
		configuration.language = vm.selectedLanguage();

		configuration.results.resultsLayout = ko.mapping.toJS(vm.resLayout());

/*
		configuration.results.title =  vm..val();  
		configuration.results.subtitle =  $("#result_conf_subtitle").val();
		configuration.results.link =  $("#result_conf_link").val();
		configuration.results.description =  $("#result_conf_description").val();
		configuration.results.image =  $("#result_conf_image").val();
*/
               var data = JSON.stringify(configuration).replace(/"/g,"\"").replace(/,/g,"\\,");
               //alert(JSON.stringify([data]));
		console.log(JSON.stringify([data]));

               $.ajax({
                    type:"POST",
                    url:"http://shannon.gsi.dit.upm.es/episteme/lmf/config/data/search.config." + core,
                    data:JSON.stringify([data]),
                    contentType:"application/json; charset=utf-8",
                    dataType:"json",
                    success: function(data){
			console.log("Configuración guardada");
			alert("Configuración guardada");
			if(refreshpage){
				window.location.reload();
			}
                        //alert("Configuración guardada!");
                    },
                    error: function() {
                        //alert("Error al guardar la configuración");
                    }
                });
}

// Cuando hay algún cambio editando los widgets
function updateWidget(id, target, field){
   //var queryText = $("#query").val();

   //if(queryText=="") queryText = "*:*";

	//console.log("widget id: " + id);
	//console.log("widget target: " + target);
	//console.log("widget field: " + field);

      Manager.addWidget(new AjaxSolr.TagcloudWidget({
        id: id,
        target: '#' + target,
        field: field
      }));

    Manager.store.addByValue('q', '*:*');

    var params = {
      facet: true,
      'facet.field': field,
      'facet.limit': 10,
      'facet.sort': 'count',
      'facet.mincount': 1,
      'json.nl': 'map'
    };

    for (var name in params) {
      Manager.store.addByValue(name, params[name]);
    }

    Manager.doRequest();

}

function getResultsSPARQL(sparql_query){
	/*
	$('#docs').empty();
	$('#results_sparql').empty();
	$('#pager').empty();	
	$('#pager-header').hide();
	$('.seleccion_actual').hide();		
*/
	console.log("getResultsSPARQL");
	var queryText = sparql_query;	
	queryText = encodeURIComponent(queryText);
	queryText = decodeURIComponent(queryText);

  	$.ajax({	
  		type: 'GET',
  		url: vm.sparql_baseURL(),
  		data: { query: queryText, output: 'json' },
  		beforeSend: function(){
  		// Validación
		$('#loading').show();
  	},
  	complete: function(){
     		$('#loading').hide();
  	},
  	success: function(data) {    
    		// get the table element
    		var table = $("#results_sparql");              

    		// get the sparql variables from the 'head' of the data.
    		var headerVars = data.head.vars; 

    		// using the vars, make some table headers and add them to the table;
    		var trHeaders = getTableHeaders(headerVars);
    		table.append(trHeaders);  

    		// grab the actual results from the data.                                          
    		var bindings = data.results.bindings;
			$('#pager-header').html($('<span/>').text('Viendo ' + bindings.length + ' resultados')).show();
    		console.log("Número resultados: " + bindings.length);
			
			//var bindings = data.results.bindings;
			//ko.mapping.fromJS(bindings, vm.viewData);
			
    		// for each result, make a table row and add it to the table.
    		for(rowIdx in bindings){
      			table.append(getTableRow(headerVars, bindings[rowIdx]));
    		} 

  	},
  	error: function() {
		$('#docs').append("Consulta fallida");  
  	}
  	});   
}


function getSemanticFields(){
	var currentVal = configuration.baseURL;

}

       function Popup(title,type) {

           if(!type) type="normal";

           var self = this;

           var template = "<div style='display:none' id='popup'><h1 id='popup_title' class='popup_title_"+type+"'>Test</h1><div id='popup_content'></div><div id='popup_buttons'></div></div>"

            $("#background-black").show();
            var box = $(template);
             $('body').append(box);
             $("#popup_title").text(title);

           this.appendContent = function(content) {
               $("#popup_content").append(content);
           }

           this.appendButton = function(button) {
               $("#popup_buttons").append(button);
           }

           this.close = function() {
               $("#popup").remove();
              $("#background-black").hide();
           }
           this.show = function() {
               box.show();
           }

       }


function addRow(i){
	
	console.log("Valor de i: " + i_layoutresultsextra);
	$("#layout").append("<tr><td>Campo extra</td><td><select id='result_conf_extra"+i_layoutresultsextra+"'>"+semantic_option_fields+"</select></td></tr>");

}
/*
function showDynamicRows(){
	var result = '';

	for(var i=0; i<=vm.layoutResultsExtraItems().length;i++) {
		var index = i+1;
		result += "<tr><td>EXTRA</td><td><select id='result_conf_extra+'" + index + "'>"+semantic_option_fields+"</select></td></tr>";
		$("#result_conf_extra").val(vm.layoutResultsExtraItems()[index]);
		console.log("EXTRA: " + vm.layoutResultsExtraItems()[index]);
	}
	return result;
}
*/
function editResultsLayoutold() {
		//vm.isOpen(true);

// Cambios en tiempo real
/*
            var popup = new Popup("Editar Layout");

			i_layoutresultsextra = vm.layoutResultsExtraItems().length;

			var doc = $("<table id=layout>"
                            +"<tr><td>Título</td><td><select id='result_conf_title'>"+semantic_option_fields+"</select></td></tr>"
      			    +"<tr><td>Subtítulo</td><td><select id='result_conf_subtitle'>"+semantic_option_fields+"</select></td></tr>"
                            +"<tr><td>Enlace</td><td><select id='result_conf_link'>"+semantic_option_fields+"</select></td></tr>"                            
			    +"<tr><td>Imagen</td><td><select id='result_conf_image'>"+semantic_option_fields+"</select></td></tr>"                            				    +"<tr><td>Descripción</td><td><select id='result_conf_description'>"+semantic_option_fields+"</select></td></tr>"
			    + showDynamicRows()
                            +"</table>"
			    +"<button onclick='i_layoutresultsextra++; addRow(i_layoutresultsextra);'>Añadir otra fila</button>");

                    //fill configuration
                    popup.appendContent(doc);
		    
		    var old_title = configuration.results.title;
		    var old_subtitle = configuration.results.subtitle;
		    var old_link = configuration.results.link;
		    var old_description = configuration.results.description;
	            var old_image = configuration.results.image;

                    $("#result_conf_title").val(configuration.results.title);
                    $("#result_conf_subtitle").val(configuration.results.subtitle);
                    $("#result_conf_link").val(configuration.results.link);
                    $("#result_conf_description").val(configuration.results.description);
                    $("#result_conf_image").val(configuration.results.image);
                    //$("#result_conf_thumb").val(configuration.results.thumb);
			
			$('select').click(function () {
				updateResultsWidget();	
				return false;		
			});

                    var close = $("<button></button>").text("Cancelar").click(function(){
			
			configuration.results.title =  old_title;  
			configuration.results.subtitle =  old_subtitle;
			configuration.results.link =  old_link;
			configuration.results.description =  old_description;
			configuration.results.image =  old_image;

			updateResultsWidget("true");
                        popup.close();

                    });
                    var ok = $("<button></button>").text("Aceptar").click(function(){

                        //configuration.results.thumb =  $("#result_conf_thumb").val();	
			
			updateResultsWidget();
			popup.close();  
                    });

                    popup.appendButton(close);
                    popup.appendButton(ok);
		    popup.show();

*/
}

function updateResultsWidget(cancel){

//for (var facet in Manager.response.facet_counts.facet_fields["province"]) {
//}

	if(cancel){

	}else{
		configuration.results.title =  $('#result_conf_title').val();  
		configuration.results.subtitle =  $("#result_conf_subtitle").val();
		configuration.results.link =  $("#result_conf_link").val();
		configuration.results.description =  $("#result_conf_description").val();
		configuration.results.image =  $("#result_conf_image").val();

		for(var i=1; i<=i_layoutresultsextra;i++) {
			var wgt = $('#result_conf_extra'+i).val();
			configuration.results.extra.push(wgt);
			console.log("dentro del for");
			console.log("wgt vale: " + wgt);
		}
	}

    $("#docs").empty();
    for (var i = 0, l = Manager.response.response.docs.length; i < l; i++) {
      var doc = Manager.response.response.docs[i];
      $("#docs").append(AjaxSolr.theme('result', doc, AjaxSolr.theme('snippet', doc)));
    }
}

function checkBoxSearch(){
	alert("Hola");
}

function graphWidgetWizard(){

            var popup = new Popup("Configuración del widget");

			var doc = $('<p><input id="sgvizlerQuery" type="text" placeholder="sgvizlerQuery" size="300"></input> </p>');

           //fill configuration
           popup.appendContent(doc);

				var close = $("<button></button>").text("Cancelar").click(function(){
                        popup.close();

                    });
				var ok = $("<button></button>").text("Aceptar").click(function(){

					var sgvizlerQuery = $('#sgvizlerQuery').val();
					
					refreshpage = true;
					iNettuts.addWidget("#column0tab0", {
						id: Math.floor(Math.random() * 10001),
						color: "color-blue",			
						title: "Nuevo widget",
						type: "sgvizler",
						query: HtmlEncode(sgvizlerQuery)
					})		
		
					iNettuts.saveAllPreferences();
		
					popup.close();  
					
					
                 });

				popup.appendButton(close);
				popup.appendButton(ok);
				popup.show();		   

}

function HtmlEncode(s)
{
  var el = document.createElement("div");
  el.innerText = el.textContent = s;
  s = el.innerHTML;
  return s;
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
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
		console.log("Distinto de undefined");
            if (obj1[prop]().toString().toLowerCase() == obj2[prop]().toString().toLowerCase())
                return 0;
            else if (obj1[prop]().toString().toLowerCase() < obj2[prop]().toString().toLowerCase())
                return -1;
            else
                return 1;
	}else{
		console.log("Undefined");
		return 1;	
	}
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
				console.log("UPDATE EN: " + allBindingsAccessor().latitude);
                viewModel._mapMarker.setPosition(latlng);
				
            }
        };



var vm = new ResultsListViewModel();

