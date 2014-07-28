// New widget
var widgetBarras = {
	// Widget name.
	name: "Barras",
	// Widget description.
	description: "Barras",
	// Path to the image of the widget.
	img: "img/widgets/widgetBarras.png",
	// Type of the widget.
	type: "barrasChart",
	// Help display on the widget
	help_en: "This widget shows a graphic bar with the ",
	help_es: "Ayuda",
	// [OPTIONAL] data taken from this field.
	// field: "created",
	// Category of the widget (1: textFilter, 2: numericFilter, 3: graph, 5:results)
	cat: 3,


	render: function () {
		var id = 'A' + Math.floor(Math.random() * 10001);
		var field = widgetBarras.field || "";
		vm.activeWidgetsRight.push({"id":ko.observable(id),
									"title": ko.observable(widgetBarras.name), 
									"type": ko.observable(widgetBarras.type), 
									"help_en": ko.observable(widgetBarras.help_en), 
									"help_es": ko.observable(widgetBarras.help_es),
									"field": ko.observable(widgetBarras.field),
									"collapsed": ko.observable(false), 
									"showWidgetHelp":ko.observable(false)});
		
		// widgetB.paint(field, id, widgetBarras.type);
		widgetBarras.paint(id);
	},

	options: {

	},

	// paint: function (field, id, type) {
	paint: function (id) {
		console.log(Manager.response.response.numFound);
		// Erase all the content of the widget
		$('#' + id).empty();

		$('#'+id).append("<div></div>")
		$('#' + id + ' > div').addClass('widget-configuration');

		// arrayEntitySentiment = [];
		// for (var i = 0; i < vm.filteredData().length; i++) {
		// 	arrayEntitySentiment.push({'entity': vm.filteredData()[i]['entity']()[0], 'sentiment': parseInt(vm.filteredData()[i]['polarityValue']()[0])})
		// }
		// console.log(arrayEntitySentiment)
		if (vm.filteredData().length != Manager.response.response.numFound) {
			return;
		} 

		arrayFields = [];
		fieldsSeleccionado = {};
		polarity = {};

		entity = ''
		for (var i = 0; i < vm.filteredData().length; i++) {

			entityNew = vm.filteredData()[i]['entity']()[0];
			// console.log(vm.filteredData()[i]['polarityValue']()[0]);
			polarityNew = parseFloat(vm.filteredData()[i]['polarityValue']()[0]);

			entityInArray = false;
			for (var j = 0; j < arrayFields.length; j++) {
				entity = arrayFields[j]
				if (entity == entityNew) {
					entityInArray = true;
				}
			}

			if (!entityInArray) {
				arrayFields.push(entityNew);
				fieldsSeleccionado [entityNew] = true;
				polarity[entityNew] = {'positive': 0, 'negative': 0};
			} 

			if (polarityNew > 0.5) {
				polarity[entityNew]['positive'] += 1;
			} else {
				polarity[entityNew]['negative'] += 1;
			}
			
		}

		// console.log(arrayFields);
		// console.log(fieldsSeleccionado);
		console.log(polarity);

		if (widgetBarras.options[id] == undefined) {
			widgetBarras.options[id] = fieldsSeleccionado;
		} else {
			fieldsSeleccionado = widgetBarras.options[id];
		}

		for (var i = 0; i < arrayFields.length; i++) {
			$('#' + id + ' > div').append('<input type="checkbox" id="' + id + arrayFields[i] + '" name="group' + id + '" value="' + arrayFields[i] + '">' + arrayFields[i] + '</input>')
			// $('#' + id + arrayFields[i]).prop('checked', true)
		}

		$('input:checkbox').on('change', function(){

			for (var i = 0; i < arrayFields.length; i++) {
				if ($('#' + id + arrayFields[i]).prop('checked')){
					fieldsSeleccionado[arrayFields[i]] = true;
				} else {
					fieldsSeleccionado[arrayFields[i]] = false;
				}
			}

			widgetBarras.options[id] = fieldsSeleccionado;

			widgetBarras.paint(id)
		});

		seleccionado = false;
		for (var i = 0; i < arrayFields.length; i++) {
			if (fieldsSeleccionado[arrayFields[i]]) {
				seleccionado = true;
				$('#' + id + arrayFields[i]).prop('checked', true)
			} else {
				polarity[arrayFields[i]] = null
				// seleccionado = false;
			}
		}
		console.log(polarity);

		if (!seleccionado) {
			$('#'+id).append('<div id="tooltip"></div>');
			$("#" + id + " > #tooltip").append("No hay ningún campo seleccionado.");
			return;
		}

		// polarity = {};
		// for (var i = 0; i < vm.filteredData().length; i++) {
		// 	entity = vm.filteredData()[i]['entity']()[0]
		// 	// if (!$('#' + id + arrayFields[i]).prop('checked')) {
		// 	// 	continue;
		// 	// }
		// 	if (vm.filteredData()[i]['polarityValue']()[0] == 1) {
		// 		polarity[entity]['positive'] += 1;
		// 	} else if (vm.filteredData()[i]['polarityValue']()[0] == -1){
		// 		polarity[entity]['negative'] += 1;
		// 	}
		// }
		// console.log(polarity)
		// return;

		// Max value & number of companies:
		// max = 0;
		// numberComp = 0;
		// for (var i in polarity) {
		// 	++numberComp;
		// 	for (var j in polarity[i]) {
		// 		if (polarity[i][j] > max) {
		// 			max = polarity[i][j];
		// 		}
		// 	}
		// }
		// console.log(max)
		// console.log('number companies: ' + numberComp)

		arrayPolarity = [];
		arrayNameCompanies = [];
		for (var i in polarity) {
			if (polarity[i] == null) {
				continue;
			};
			arrayPolarity.push(polarity[i]['positive']);
			arrayPolarity.push(polarity[i]['negative']);
			arrayNameCompanies.push(i);
			arrayNameCompanies.push(i);
		}
		max = Math.max.apply(Math, arrayPolarity);
		numberComp = arrayPolarity.length / 2;

		// console.log(arrayPolarity);
		// console.log(max);
		// console.log(numberComp);

		//var data = datos;
		var margin1 = {top: 30, right: 15, bottom: 10, left: 15},
			width1 = $('#' + id).width() - margin1.left - margin1.right,
			height1 = 90*numberComp - margin1.top - margin1.bottom;

		var x0 = max;

		var x1 = d3.scale.linear()
			.domain([-x0, x0])
			.range([0, width1])
			.nice();

		var y1 = d3.scale.ordinal()
			.domain(d3.range(numberComp))
			.rangeRoundBands([0, height1], .2);

		console.log(y1);

		var xAxis = d3.svg.axis()
			.scale(x1)
			.orient("top");

		var svg = d3.select('#' + id).append("svg:svg")
			.attr("width", width1 + margin1.left + margin1.right)
			.attr("height", height1 + margin1.top + margin1.bottom)
		  .append("g")
			.attr("transform", "translate(" + margin1.left + "," + margin1.top + ")");

		svg.selectAll(".bar")
			.data(arrayPolarity)
		  .enter().append("rect")
			.attr("class", function(d, i) { 
				if ((i%2) == 0) {
					return "bar_positive";
				} else {
					return "bar_negative"
				}
			})
			.attr("x", function(d, i) { 
				if ((i%2) == 0) {
					return x1(0);
				} else {
					return x1(-d);
				}
			})
			.attr("y", function(d, i) { 
				return y1(Math.floor(i/2));
			})
			.style("fill-opacity", ".6")
			.style("fill", function(d, i) {
				if ((i%2) == 0) {
					return "green";
				} else {
					return "red"
				}
			})
			.attr("width", function(d, i) { 
				if ((i%2) == 0) {
					return x1(d) - x1(0);
				} else {
					return x1(0) - x1(-d);
				} 
			})
			.attr("height", y1.rangeBand);

		var text = svg.selectAll(".bar")
			.data(arrayNameCompanies)
			.enter().append("svg:text")
			//.attr("class", function(d) { return d < 0 ? "bar negative" : "bar positive"; })
			.text(function(d, i) {
				if ((i%2) == 0) {
					return d;
				} else {
					return '';
				}
			})
			.attr("x", function(d, i) { 
				return x1(0)
			})
			.attr("y", function(d, i) { 
				// console.log(y1(Math.floor(i/2)) + (y1.rangeBand()));
				return (y1(Math.floor(i/2)) + y1.rangeBand()/2 - 5); 
			})
			.attr("dy", ".50em")
		    .attr("text-anchor", function(d) {
		    	return "middle"
		    })
		    .attr("stroke", "black")
			.style("font", "300 25px sans-serif")

		svg.append("g")
			.attr("class", "x axis")
			.call(xAxis);

		svg.append("g")
			.attr("class", "y axis")
		  .append("line")
			.attr("x1", x1(0))
			.attr("x2", x1(0))
			.attr("y1", 0)
			.attr("y2", height1);
	
	}
};