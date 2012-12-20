/*
 * Script from NETTUTS.com
 * @requires jQuery($), jQuery UI & sortable/draggable UI modules
 */
var refreshpage = false;

var iNettuts = {
    
    jQuery : $,
    
    settings : {
        columns : '.column',
        widgetSelector: '.widget',
        handleSelector: '.widget-head',
        contentSelector: '.widget-content',
        
        saveToDB: true,
        
        widgetDefault : {
            movable: true,
            removable: true,
            collapsible: true,
            editable: true,
            colorClasses: ['color-yellow', 'color-red', 'color-blue', 'color-white', 'color-orange', 'color-green'],
            content: "<div align='center'>Personaliza este widget</div>"
        },
        widgetIndividual : {
            widget_results : {
                movable: true,
                removable: true,
                collapsible: true,
                editable: true
           }
        },
    },

	

    init : function () {
        this.attachStylesheet('inettuts.js.css');
		
        $(this.settings.columns).css({visibility:'visible'});
        //this.addWidgetControls();
	this.addResultsWidgetControls();        
	this.makeSortable();
    },
    
    initWidget : function (opt) {
      if (!opt.content) opt.content=iNettuts.settings.widgetDefault.content;
	//console.log("Widget FIELD: " + opt.field);
      var target = opt.id + 'f';

      return '<li id="'+opt.id+'" class="new widget '+opt.color+'"><div class="widget-head"><h3>'+opt.title+'</h3></div><div class="widget-content" id="'+ target + '"></div><h1 style="visibility: hidden; margin: 0px; font-size: 0px;">'+opt.type+'</h1></li>';
    },
    
    initResultsWidget : function (opt) {
      if (!opt.content) opt.content=iNettuts.settings.widgetDefault.content;
	//console.log("Widget FIELD: " + opt.field);
      //var target = opt.id + 'f';
/*      
	  return '<li id="'+opt.id+'" class="new widget '+opt.color+'">'+
'<div class="widget-head"><h3>'+opt.title+'</h3></div>' +
'<div class="widget-content"><div class="resultswidget-header"><div class="seleccion_actual"><h2>Selección</h2><ul id="currentselection"></ul></div><div id="loading"><img src="images/ajax-loader.gif"></div><div id="pager-header"></div><ul id="pager"></ul></div><table id="results_sparql"></table><div id="docs"></div></div><h1 style="visibility: hidden; margin: 0px; font-size: 0px;">'+opt.type+'</h1></li>';
*/
	
	  return '<li id="'+opt.id+'" class="new widget '+opt.color+'">'+
'<div class="widget-head"><h3>'+opt.title+'</h3></div>' +
'<div class="widget-content"><div class="resultswidget-header"><div class="seleccion_actual"><h2>Selección</h2><ul id="currentselection" data-bind="visible: !lightmode()"></ul><div data-bind="visible: lightmode"><p data-bind="text: filterCategory"></p><button data-bind="click: $root.resetFilterCategory">Eliminar</button></div></div><div id="loading"><img src="images/ajax-loader.gif"></div><div data-bind="visible: !lightmode()"><div id="pager-header" ></div><ul id="pager"></ul></div><select data-bind="options: dataColumns,value: sortBy, optionsCaption: "Ordenar por...", enable: viewData().length > 0 && lightmode"></select></div><table id="results_sparql"></table><div data-bind="foreach: filteredData"><div class="resultado"><img id="image" data-bind="attr: {src: $data[configuration.results.image]}"></img><h2 data-bind="text: $data[configuration.results.title]"></h2><h4 data-bind="text: $data[configuration.results.subtitle]"></h4><p data-bind="text: $data[configuration.results.description]"></p></div></div></div><h1 style="visibility: hidden; margin: 0px; font-size: 0px;">'+opt.type+'</h1></li>';
	
    },	
	
    initSgvizlerWidget : function (opt) {
      if (!opt.content) opt.content=iNettuts.settings.widgetDefault.content;
	  
      var target = opt.id + 'f';
	  
      return '<li id="'+opt.id+'" class="new widget '+opt.color+'"><div class="widget-head"><h3>'+opt.title+'</h3></div><div class="widget-content"><div id="'+opt.id+'_sgvizler" data-sgvizler-endpoint="'+ vm.sparql_baseURL() +'"?" data-sgvizler-query="'+opt.query+'" data-sgvizler-chart="gPieChart" data-sgvizler-loglevel="0" data-sgvizler-chart-options="is3D=true|title=Number of instances" style="width:500px; height:200px; background:#fff;"></div></div><h1 style="visibility: hidden; margin: 0px; font-size: 0px;">'+opt.type+'</h1><h2 style="visibility: hidden; margin: 0px; font-size: 0px;">'+opt.query+'</h2></li>';	  
	//console.log("Widget FIELD: " + opt.field);
      //var target = opt.id + 'f';
      //return '<li id="'+opt.id+'" class="new widget '+opt.color+'"><div class="widget-head"><h3>'+opt.title+'</h3></div><div class="widget-content"><div id="'+opt.id+'_sgvizler" data-sgvizler-endpoint="'+ vm.sparql_baseURL() +'"?" data-sgvizler-query="'+opt.query+'" data-sgvizler-chart="gPieChart" data-sgvizler-loglevel="0" data-sgvizler-chart-options="is3D=true|title=Number of instances" style="width:500px; height:200px; background:#fff;"></div></div><h1 style="visibility: hidden; margin: 0px; font-size: 0px;">'+opt.type+'</h1><h2 style="visibility: hidden; margin: 0px; font-size: 0px;">'+opt.query+'</h2></li>';

    },	
	
    initSgvizlerWidgetAuto : function (opt) {
      if (!opt.content) opt.content=iNettuts.settings.widgetDefault.content;
	  
      var target = opt.id + 'f';
	  
      return '<li id="'+opt.id+'" class="new widget '+opt.color+'"><div class="widget-head"><h3>'+opt.title+'</h3></div><div class="widget-content" id="'+ target + '"></div><h1 style="visibility: hidden; margin: 0px; font-size: 0px;">'+opt.type+'</h1></li>';	  
	//console.log("Widget FIELD: " + opt.field);
      //var target = opt.id + 'f';

    },		

    
    addWidget : function (where, opt) {
      $("li").removeClass("new");
      var selectorOld = iNettuts.settings.widgetSelector;
      iNettuts.settings.widgetSelector = '.new';
      
	  
	  if(opt.type=="tagcloud"){
		$(where).prepend(iNettuts.initWidget(opt));
		iNettuts.addTagWidgetControls(opt);  
		//console.log("TYPE: " + opt.type);
	  }else if(opt.type=="results"){
		//console.log("RESULTS: " + opt.type);
		//console.log("ID RESULTS: " + opt.id);
		$(where).prepend(iNettuts.initResultsWidget(opt));
		iNettuts.addResultsWidgetControls(opt);
		
	  }else if(opt.type=="sgvizler"){
		//console.log("sgvizler con query: " + opt.query);
		
		$(where).prepend(iNettuts.initSgvizlerWidget(opt));
		iNettuts.addGraphWidgetControls(opt);
			
	  }else if(opt.type=="sgvizler_auto"){
		$(where).prepend(iNettuts.initSgvizlerWidgetAuto(opt));
		iNettuts.addGraphWidgetControls(opt);
	  }
		
          
      iNettuts.settings.widgetSelector = selectorOld;
      iNettuts.makeSortable();

		if (opt.collapsed=='collapsed') $('#'+opt.id).addClass('collapsed');

    },
    
    
    getWidgetSettings : function (id) {
        var $ = this.jQuery,
            settings = this.settings;

        //console.log("GetWidgetSettings con id: " + id);
        return (id&&settings.widgetIndividual[id]) ? $.extend({},settings.widgetDefault,settings.widgetIndividual[id]) : settings.widgetDefault;
    },
    
    addWidgetControls : function () {
        var iNettuts = this,
            $ = this.jQuery,
            settings = this.settings;
            
        $(settings.widgetSelector, $(settings.columns)).each(function () {
            var thisWidgetSettings = iNettuts.getWidgetSettings(this.id);
            if (thisWidgetSettings.removable) {
                $('<a href="#" class="remove">CLOSE</a>').mousedown(function (e) {
                    e.stopPropagation();    
                }).click(function () {
                    if(confirm('This widget will be removed, ok?')) {
                        $(this).parents(settings.widgetSelector).animate({
                            opacity: 0    
                        },function () {
                            $(this).wrap('<div/>').parent().slideUp(function () {
                                $(this).remove();
                            });
                        });
                    }
                    return false;
                }).appendTo($(settings.handleSelector, this));
            }
            
            if (thisWidgetSettings.editable) {
                $('<a href="#" class="edit">EDIT</a>').mousedown(function (e) {
                    e.stopPropagation();    
                }).toggle(function () {
                    $(this).css({backgroundPosition: '-66px 0', width: '55px'})
                        .parents(settings.widgetSelector)
                            .find('.edit-box').show().find('input').focus();
                    return false;
                },function () {
                    $(this).css({backgroundPosition: '', width: ''})
                        .parents(settings.widgetSelector)
                            .find('.edit-box').hide();
                    return false;
                }).appendTo($(settings.handleSelector,this));
                $('<div class="edit-box" style="display:none;"/>')
                    .append('<ul><li class="item"><label>Título:</label><input value="' + $('h3',this).text() + '"/></li>')
                    .append((function(){
                        var colorList = '<li class="item"><label>Colores disponibles:</label><ul class="colors">';
                        $(thisWidgetSettings.colorClasses).each(function () {
                            colorList += '<li class="' + this + '"/>';
                        });
                        return colorList + '</ul>';
                    })())
                    .append('</ul>')
                    .insertAfter($(settings.handleSelector,this));
            }
            
            if (thisWidgetSettings.collapsible) {
                $('<a href="#" class="collapse">COLLAPSE</a>').mousedown(function (e) {
                    /* STOP event bubbling */
                    e.stopPropagation();    
                }).click(function(){
                    $(this).parents(settings.widgetSelector).toggleClass('collapsed');
                    return false;    
                }).prependTo($(settings.handleSelector,this));
            }
        });
        
        $('.edit-box').each(function () {
            $('input',this).keyup(function () {
                $(this).parents(settings.widgetSelector).find('h3').text( $(this).val().length>20 ? $(this).val().substr(0,20)+'...' : $(this).val() );
            });
            $('ul.colors li',this).click(function () {
                
                var colorStylePattern = /\bcolor-[\w]{1,}\b/,
                    thisWidgetColorClass = $(this).parents(settings.widgetSelector).attr('class').match(colorStylePattern)
                if (thisWidgetColorClass) {
                    $(this).parents(settings.widgetSelector)
                        .removeClass(thisWidgetColorClass[0])
                        .addClass($(this).attr('class').match(colorStylePattern)[0]);
                }
                return false;
                
            });
        });
        
    },

    addTagWidgetControls : function (opt) {
        var iNettuts = this,
            $ = this.jQuery,
            settings = this.settings;
            
        $(settings.widgetSelector, $(settings.columns)).each(function () {
            var thisWidgetSettings = iNettuts.getWidgetSettings(this.id);
            if (thisWidgetSettings.removable) {
                $('<a href="#" class="remove">CLOSE</a>').mousedown(function (e) {
                    /* STOP event bubbling */
                    e.stopPropagation();    
                }).click(function () {
                    if(confirm('Este widget va a ser eliminado')) {
                        $(this).parents(settings.widgetSelector).animate({
                            opacity: 0    
                        },function () {
                            $(this).wrap('<div/>').parent().slideUp(function () {
                                $(this).remove();
                            });

                         for(var i=0; i<configuration.widgets.length;i++) {
                            if(configuration.widgets[i].id==this.id) {
				// En la posición i-ésima eliminar el widget
                                configuration.widgets.splice(i,1);
				saveConfiguration(core);
                                break;
                            }
                         }
			
                        });
                    }
                    return false;
                }).appendTo($(settings.handleSelector, this));
            }
            
            if (thisWidgetSettings.editable) {
				

                $('<a href="#" class="edit">EDIT</a>').mousedown(function (e) {
                    /* STOP event bubbling */
                    e.stopPropagation();    
                }).toggle(function () {
                    $(this).css({backgroundPosition: '-66px 0', width: '55px'})
                        .parents(settings.widgetSelector)
                            .find('.edit-box').show().find('input').focus();
                    return false;
                },function () {
		    
                    $(this).css({backgroundPosition: '', width: '24px'})
                        .parents(settings.widgetSelector)
                            .find('.edit-box').hide();
                    return false;
                }).appendTo($(settings.handleSelector,this));
                $('<div class="edit-box" style="display:none;"/>')
                    .append('<ul><li class="item"><label>Nombre del Widget</label><input value="' + $('h3',this).text() + '"/></li>')
                    .append((function(){
                        var colorList = '<li class="item"><label>Color</label><ul class="colors">';
                        $(thisWidgetSettings.colorClasses).each(function () {
                            colorList += '<li class="' + this + '"/>';
                        });
                        return colorList + '</ul>';
                    })())
			.append('<li class="item"><label>Tipo de dato</label>').append((function(){
					
						var wsf = widget_semantic_fields;
						var selected = $(wsf.replace('option value="'+opt.field+'"', 'option value="'+opt.field+'" selected="true"'));
						return selected;
					})())
                    .append('</ul>')
                    .insertAfter($(settings.handleSelector,this));

			}
            
            if (thisWidgetSettings.collapsible) {
                $('<a href="#" class="collapse">COLLAPSE</a>').mousedown(function (e) {
                    /* STOP event bubbling */
                    e.stopPropagation();    
                }).click(function(){
                    $(this).parents(settings.widgetSelector).toggleClass('collapsed');
                    return false;    
                }).prependTo($(settings.handleSelector,this));
            }
        });
        
	// Eventos en tiempo real
        $('.edit-box').each(function () {
            $('input',this).keyup(function () {
                $(this).parents(settings.widgetSelector).find('h3').text( $(this).val().length>20 ? $(this).val().substr(0,20)+'...' : $(this).val() );
				//console.log("Cambio de nombre");
				
                //iNettuts.savePreferences($(this).parents(settings.widgetSelector).attr('id'), $(this).parents(settings.widgetSelector).find('h3').text(), $(this).parents(settings.widgetSelector).find('select option:selected').text());
            });
            $('ul.colors li',this).click(function () {
                var colorStylePattern = /\bcolor-[\w]{1,}\b/,
                    thisWidgetColorClass = $(this).parents(settings.widgetSelector).attr('class').match(colorStylePattern)
                if (thisWidgetColorClass) {
                    $(this).parents(settings.widgetSelector)
                        .removeClass(thisWidgetColorClass[0])
                        .addClass($(this).attr('class').match(colorStylePattern)[0]);
                    /* Save prefs to cookie: */
			console.log("cambio de color");
                    //iNettuts.savePreferences($(this).parents(settings.widgetSelector).attr('id'), $(this).parents(settings.widgetSelector).find('h3').text(), $(this).parents(settings.widgetSelector).find('select option:selected').text());
                }
                return false;
	    });       
	    $('select.widget_field',this).click(function () {
		console.log("Cambio en widget field");
		
		//iNettuts.savePreferences($(this).parents(settings.widgetSelector).attr('id'), $(this).parents(settings.widgetSelector).find('h3').text(), $(this).parents(settings.widgetSelector).find('select option:selected').text());

		// id, target, field
		var id = $(this).parents(settings.widgetSelector).attr('id');
		var target = id + 'f';
		var selected = $(this).parents(settings.widgetSelector).find('select option:selected').text();
		updateWidget(id, target, selected);

		return false;
            });

        });
        
    },
    
    attachStylesheet : function (href) {
        var $ = this.jQuery;
        return $('<link href="' + href + '" rel="stylesheet" type="text/css" />').appendTo('head');
    },
    
    makeSortable : function () {
        var iNettuts = this,
            $ = this.jQuery,
            settings = this.settings,
            $sortableItems = (function () {
                var notSortable = '';
                $(settings.widgetSelector,$(settings.columns)).each(function (i) {
                    if (!iNettuts.getWidgetSettings(this.id).movable) {
                        if(!this.id) {
                            this.id = 'widget-no-id-' + i;
                        }
                        notSortable += '#' + this.id + ',';
                    }
                });
                if (notSortable=='')
                  return $("> li", settings.columns);
                else
                  return $('> li:not(' + notSortable + ')', settings.columns);
            })();
        
        $sortableItems.find(settings.handleSelector).css({
            cursor: 'move'
        }).mousedown(function (e) {
            $sortableItems.css({width:''});
            $(this).parent().css({
                width: $(this).parent().width() + 'px'
            });
	
        }).mouseup(function () {
            if(!$(this).parent().hasClass('dragging')) {
                $(this).parent().css({width:''});
		console.log("Movido");
            } else {
                $(settings.columns).sortable('disable');
            }
        });

        $(settings.columns).sortable('destroy');
        $(settings.columns).sortable({
            items: $sortableItems,
            connectWith: $(settings.columns),
            handle: settings.handleSelector,
            placeholder: 'widget-placeholder',
            forcePlaceholderSize: true,
            revert: 300,
            delay: 100,
            opacity: 0.8,
            containment: 'document',
            start: function (e,ui) {
                $(ui.helper).addClass('dragging');

            },
            stop: function (e,ui) {
                $(ui.item).css({width:''}).removeClass('dragging');
                $(settings.columns).sortable('enable');
		
                iNettuts.savePreferences();
            }
        });
    },
    
/*
    savePreferences : function (id, title, field) {
	
        var iNettuts = this,
            $ = this.jQuery,
            settings = this.settings;
        
	console.log("savePreferences con id: " + id + " y titulo: " + title + " y field: " + field);

	       var wgt = {};
               wgt.id = id;

		//console.log($(thisWidgetSettings.widgetSelector).find('h3').text("Guardado"));
               //wgt.name = $('h3',thisWidgetSettings.widgetSelector).text();
		wgt.name = title;
		console.log("Widget salvado id: " + wgt.id);
		console.log("Widget salvado name: " + wgt.name);
		console.log(configuration.baseURL);
               wgt.field = field;
		console.log("Widget salvado field: " + wgt.field);
               wgt.type = "text";

               wgt.mapper = "";
               wgt.size = 10;

               for(var i=0; i<configuration.widgets.length;i++) {
	           if(configuration.widgets[i].id==wgt.id) configuration.widgets[i]=wgt;
		   console.log("dentro del for");
               }

		saveConfiguration(core);

    },
  
	saveNewPreferences : function (id, title) {
	
        var iNettuts = this,
            $ = this.jQuery,
            settings = this.settings;
        
	console.log("saveNewPreferences con id: " + id + "y titulo: " + title);

	       var wgt = {};
               wgt.id = id;
		wgt.name = title;
		console.log("Widget salvado id: " + wgt.id);
		console.log("Widget salvado name: " + wgt.name);
		console.log(configuration.baseURL);
               wgt.field = "";
               wgt.type = "text";
               wgt.mapper = "";

               wgt.size = 10;

              	configuration.widgets.push(wgt);
		console.log("hacemos push");

		saveConfiguration(core);

	},
*/
	saveAllPreferences : function () {
        var iNettuts = this,
            $ = this.jQuery,
            settings = this.settings,
            cookieString = '';

	// Para la columna de la izquierda:
	// Borramos lo anterior
	// Salvamos para cada widget id, name, field, type
	// 
	configuration.widgets= [];
	
	//console.log("widget_semantic_fields: " + widget_semantic_fields);
	

        $(settings.columns).each(function(j){

		
            $(settings.widgetSelector,this).each(function(i){

		// Si no es el widget de results, guardamos en array widgets[]
		if($(this).attr('id')!=0){

			var wgt = {};
			wgt.id = $(this).attr('id');
			wgt.name = $('h3:eq(0)',this).text();

            wgt.type = $('h1',this).text();
			if(wgt.type=="tagcloud"){
				wgt.field = $('select option:selected',this).text();
				
			}else{
				wgt.query = $('h2',this).text();
				
			}
			
			wgt.color = $(this).attr('class').match(/\bcolor-[\w]{1,}\b/);

            wgt.mapper = "";
			wgt.col = "column" + j + "tab0";
			wgt.collapsed = $(settings.contentSelector,this).css('display') === 'none' ? 'collapsed' : 'not-collapsed';

            wgt.size = 10;
            configuration.widgets.push(wgt);

		// Si es widget de results (siempre tiene id =  0)	
		}else{
		
			configuration.results.wtitle =  $('h3:eq(0)',this).text();
			configuration.results.wtype = $('h1',this).text();
			configuration.results.wcolor = $(this).attr('class').match(/\bcolor-[\w]{1,}\b/);
			configuration.results.wcollapsed = $(settings.contentSelector,this).css('display') === 'none' ? 'collapsed' : 'not-collapsed';



		}

            });
              	
		
        });

	saveConfiguration(core, refreshpage);	

	},


    addResultsWidgetControls : function (opt) {
        var iNettuts = this,
            $ = this.jQuery,
            settings = this.settings;
            
        $(settings.widgetSelector, $(settings.columns)).each(function () {
            var thisWidgetSettings = iNettuts.getWidgetSettings(this.id);

            
            if (thisWidgetSettings.editable) {
				

                $('<a href="#" class="edit">EDIT</a>').mousedown(function (e) {
                    /* STOP event bubbling */
                    e.stopPropagation();    
                }).toggle(function () {
                    $(this).css({backgroundPosition: '-66px 0', width: '55px'})
                        .parents(settings.widgetSelector)
                            .find('.edit-box').show().find('input').focus();
                    return false;
                },function () {
		    
                    $(this).css({backgroundPosition: '', width: '24px'})
                        .parents(settings.widgetSelector)
                            .find('.edit-box').hide();
                    return false;
                }).appendTo($(settings.handleSelector,this));
                $('<div class="edit-box" style="display:none;"/>')
                    .append('<ul><li class="item"><label>Nombre del Widget</label><input value="' + $('h3',this).text() + '"/></li>')
                    .append((function(){
                        var colorList = '<li class="item"><label>Color</label><ul class="colors">';
                        $(thisWidgetSettings.colorClasses).each(function () {
                            colorList += '<li class="' + this + '"/>';
                        });
                        return colorList + '</ul>';
                    })())
			.append((function(){
			//var button = "<button onclick='vm.editResultsLayout();'>Editar Layout</button>";
			//var button = '<p><input type="checkbox" data-bind="checked: isOpen" />Open</p>';			
			//return button;
			return "";
			})()).append((function(){
				return "";												
			})())
                    .append('</ul>')
                    .insertAfter($(settings.handleSelector,this));

			}
            
            if (thisWidgetSettings.collapsible) {
                $('<a href="#" class="collapse">COLLAPSE</a>').mousedown(function (e) {
                    /* STOP event bubbling */
                    e.stopPropagation();    
                }).click(function(){
                    $(this).parents(settings.widgetSelector).toggleClass('collapsed');
                    return false;    
                }).prependTo($(settings.handleSelector,this));
            }
        });
        
	// Eventos en tiempo real
        $('.edit-box').each(function () {
            $('input',this).keyup(function () {
                $(this).parents(settings.widgetSelector).find('h3').text( $(this).val().length>20 ? $(this).val().substr(0,20)+'...' : $(this).val() );
				//console.log("Cambio de nombre");
				
                //iNettuts.savePreferences($(this).parents(settings.widgetSelector).attr('id'), $(this).parents(settings.widgetSelector).find('h3').text(), $(this).parents(settings.widgetSelector).find('select option:selected').text());
            });
            $('ul.colors li',this).click(function () {
                var colorStylePattern = /\bcolor-[\w]{1,}\b/,
                    thisWidgetColorClass = $(this).parents(settings.widgetSelector).attr('class').match(colorStylePattern)
                if (thisWidgetColorClass) {
                    $(this).parents(settings.widgetSelector)
                        .removeClass(thisWidgetColorClass[0])
                        .addClass($(this).attr('class').match(colorStylePattern)[0]);
                    /* Save prefs to cookie: */
			console.log("cambio de color");
                    //iNettuts.savePreferences($(this).parents(settings.widgetSelector).attr('id'), $(this).parents(settings.widgetSelector).find('h3').text(), $(this).parents(settings.widgetSelector).find('select option:selected').text());
                }
                return false;
	    });       
	    $('select.widget_field',this).click(function () {
		//console.log("Cambio en widget field");
		
		//iNettuts.savePreferences($(this).parents(settings.widgetSelector).attr('id'), $(this).parents(settings.widgetSelector).find('h3').text(), $(this).parents(settings.widgetSelector).find('select option:selected').text());

		// id, target, field
		var id = $(this).parents(settings.widgetSelector).attr('id');
		var target = id + 'f';
		var selected = $(this).parents(settings.widgetSelector).find('select option:selected').text();
		updateWidget(id, target, selected);

		return false;
            });

        });
        
    },


    addGraphWidgetControls : function (opt) {
        var iNettuts = this,
            $ = this.jQuery,
            settings = this.settings;
            
        $(settings.widgetSelector, $(settings.columns)).each(function () {
            var thisWidgetSettings = iNettuts.getWidgetSettings(this.id);
            if (thisWidgetSettings.removable) {
                $('<a href="#" class="remove">CLOSE</a>').mousedown(function (e) {
                    /* STOP event bubbling */
                    e.stopPropagation();    
                }).click(function () {
                    if(confirm('Este widget va a ser eliminado')) {
                        $(this).parents(settings.widgetSelector).animate({
                            opacity: 0    
                        },function () {
                            $(this).wrap('<div/>').parent().slideUp(function () {
                                $(this).remove();
                            });

                         for(var i=0; i<configuration.widgets.length;i++) {
                            if(configuration.widgets[i].id==this.id) {
								// En la posición i-ésima eliminar el widget
                                configuration.widgets.splice(i,1);
								saveConfiguration(core);
                                break;
                            }
                         }
			
                        });
                    }
                    return false;
                }).appendTo($(settings.handleSelector, this));
            }
            
            if (thisWidgetSettings.editable) {
                $('<a href="#" class="edit">EDIT</a>').mousedown(function (e) {
                    /* STOP event bubbling */
                    e.stopPropagation();    
                }).toggle(function () {
                    $(this).css({backgroundPosition: '-66px 0', width: '55px'})
                        .parents(settings.widgetSelector)
                            .find('.edit-box').show().find('input').focus();
                    return false;
                },function () {
		    
                    $(this).css({backgroundPosition: '', width: '24px'})
                        .parents(settings.widgetSelector)
                            .find('.edit-box').hide();
                    return false;
                }).appendTo($(settings.handleSelector,this));
                $('<div class="edit-box" style="display:none;"/>')
                    .append('<ul><li class="item"><label>Nombre del Widget</label><input value="' + $('h3',this).text() + '"/></li>')
                    .append((function(){
                        var colorList = '<li class="item"><label>Color</label><ul class="colors">';
                        $(thisWidgetSettings.colorClasses).each(function () {
                            colorList += '<li class="' + this + '"/>';
                        });
                        return colorList + '</ul>';
                    })())
                    .append('</ul>')
                    .insertAfter($(settings.handleSelector,this));

			}
            
            if (thisWidgetSettings.collapsible) {
                $('<a href="#" class="collapse">COLLAPSE</a>').mousedown(function (e) {
                    /* STOP event bubbling */
                    e.stopPropagation();    
                }).click(function(){
                    $(this).parents(settings.widgetSelector).toggleClass('collapsed');
                    return false;    
                }).prependTo($(settings.handleSelector,this));
            }
        });
        
	// Eventos en tiempo real
        $('.edit-box').each(function () {
            $('input',this).keyup(function () {
                $(this).parents(settings.widgetSelector).find('h3').text( $(this).val().length>20 ? $(this).val().substr(0,20)+'...' : $(this).val() );
				//console.log("Cambio de nombre");
				
                //iNettuts.savePreferences($(this).parents(settings.widgetSelector).attr('id'), $(this).parents(settings.widgetSelector).find('h3').text(), $(this).parents(settings.widgetSelector).find('select option:selected').text());
            });
            $('ul.colors li',this).click(function () {
                var colorStylePattern = /\bcolor-[\w]{1,}\b/,
                    thisWidgetColorClass = $(this).parents(settings.widgetSelector).attr('class').match(colorStylePattern)
                if (thisWidgetColorClass) {
                    $(this).parents(settings.widgetSelector)
                        .removeClass(thisWidgetColorClass[0])
                        .addClass($(this).attr('class').match(colorStylePattern)[0]);
                    /* Save prefs to cookie: */
			console.log("cambio de color");
                    //iNettuts.savePreferences($(this).parents(settings.widgetSelector).attr('id'), $(this).parents(settings.widgetSelector).find('h3').text(), $(this).parents(settings.widgetSelector).find('select option:selected').text());
                }
                return false;
	    });       
	    $('select.widget_field',this).click(function () {
		//console.log("Cambio en widget field");
		
		//iNettuts.savePreferences($(this).parents(settings.widgetSelector).attr('id'), $(this).parents(settings.widgetSelector).find('h3').text(), $(this).parents(settings.widgetSelector).find('select option:selected').text());

		// id, target, field
		var id = $(this).parents(settings.widgetSelector).attr('id');
		var target = id + 'f';
		var selected = $(this).parents(settings.widgetSelector).find('select option:selected').text();
		updateWidget(id, target, selected);

		return false;
            });

        });
        
    }	
	

};
iNettuts.init();
