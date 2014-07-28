// New widget
var widgetWheel = {
	// Widget name.
	name: "Wheel",
	// Widget description.
	description: "Wheel",
	// Path to the image of the widget.
	img: "img/widgets/widgetWheel.png",
	// Type of the widget.
	type: "wheelChart",
	// Help display on the widget
	help_en: "Wheel representation of the data. Click in the different pieces to focus on it.",
	help_es: "Ayuda",
	// [OPTIONAL] data taken from this field.
	// field: "polarityValue",
	// Category of the widget (1: textFilter, 2: numericFilter, 3: graph, 5:results)
	cat: 3,

	render: function () {
		var id = 'A' + Math.floor(Math.random() * 10001);
		var field = widgetWheel.field || "";
		vm.activeWidgetsRight.push({"id":ko.observable(id),
									"title": ko.observable(widgetWheel.name), 
									"type": ko.observable(widgetWheel.type), 
									"help_en": ko.observable(widgetWheel.help_en), 
									"help_es": ko.observable(widgetWheel.help_es),
									"field": ko.observable(widgetWheel.field),
									"collapsed": ko.observable(false), 
									"showWidgetHelp":ko.observable(false)});

		// widgetWheel.paint(field, id, widgetWheel.type);
		widgetWheel.paint(id);
	},

	options: {

	},

	// paint: function (field, id, type) {	
	paint: function (id) {

		// Erase all the content of the widget
		$('#' + id).empty();

		$('#'+id).append("<div></div>")
		// $('#' + id + ' > div').addClass('widget-configuration');

		// group0 = 'group' + id + '0';
		// group1 = 'group' + id + '1';

		// for (var i = 0; i < vm.resultsGraphs().length; i++) {
		// 	$('#' + id + ' > div').append('<input type="radio" name="' + group0 + '" value="' + vm.resultsGraphs()[i].type() + '">' + vm.resultsGraphs()[i].type() + '</input>')
		// }
		// $('#' + id + ' > div').append('<hr>')
		// for (var i = 0; i < vm.resultsGraphs().length; i++) {
		// 	$('#' + id + ' > div').append('<input type="radio" name="' + group1 + '" value="' + vm.resultsGraphs()[i].type() + '">' + vm.resultsGraphs()[i].type() + '</input>')
		// }
		
		// for (var i = 0; i < vm.resultsGraphs().length; i++) {
		// 	$('#' + id + ' > div').append('<input type="radio" name="group' + id + '1" value="' + vm.resultsGraphs()[i].type() + '">' + vm.resultsGraphs()[i].type() + '</input>')
		// }

		// valorSeleccionado0 = widgetWheel.options[group0];
		// valorSeleccionado1 = widgetWheel.options[group1];

		// $('input:radio').on('change', function(){
		// 	valorSeleccionado0 = $('input:radio[name=' + group0 + ']:checked').val();
		// 	widgetWheel.options[group0] = valorSeleccionado0;
		// 	valorSeleccionado1 = $('input:radio[name=' + group1 + ']:checked').val();
		// 	widgetWheel.options[group1] = valorSeleccionado1;
		// 	widgetWheel.paint(id)
		// });

		// if (valorSeleccionado0 != undefined) {
		// 	// $('#'+id).append('<div id="tooltip">' + widgetWheel.options[group0].toUpperCase() + '</div>');
		// 	$('input[name="' + group0 + '"][value="' + widgetWheel.options[group0] + '"]').prop('checked', true);
		// }  
		// if (valorSeleccionado1 != undefined){
		// 	//$('#'+id).append('<div id="tooltip">' + widgetWheel.options[group1].toUpperCase() + '</div>');
		// 	$('input[name="' + group1 + '"][value="' + widgetWheel.options[group1] + '"]').prop('checked', true);
		// } 
		// if ((valorSeleccionado0 == undefined) || (valorSeleccionado1 == undefined)) {
		// 	$('#'+id).append('<div id="tooltip"></div>');
		// 	$("#" + id + " > #tooltip").append("Faltan campos por seleccionar.");
		// 	return;
		// } else {
		// 	// $('#'+id + ' > .widget-configuration').hide();
		// 	// return;
		// }

		// console.log(vm.filteredData().length);
		
		if (vm.filteredData().length > 150) {

			$('#' + id + ' > svg').remove();

			d3.select('#'+id).select('svg').remove();
			d3.select('#'+id).select('#tooltip_wheel').remove();

			$('#'+id).append('<div id="tooltip_wheel"></div>');
			$("#" + id + " > #tooltip_wheel").append("Demasiados resultados, aumente el número de filtros.");

			return;

		}

		// Wheel
		var array = new Array();
		$.each(vm.filteredData(), function(index, item) {

			var one;
			var location = new String(item["entity"]()[0]);
			var resultOne = $.grep(array, function(e) { return e["name"].valueOf() == location.valueOf(); });

			if (resultOne.length == 0) {
				one = new Object();
				one["name"] = location;
				one["children"] = new Array();
				array.push(one);
			} else {
				one = resultOne[0];
			}

			var two;
			var polarity = "";
			// if (valorSeleccionado1 == "hasPolarity") {
				polarity = item["hasPolarity"]()[0].substring(24);
			// } else {
			// 	// polarity = item[valorSeleccionado1]()[0];
			// }

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
			three["name"] = new String(item.opinionText());
			var value = parseFloat(item.polarityValue());

			if (value <  0.5) {
				three["colour"] = "#FE2E2E";
			} else if (value > 0.5) {
				three["colour"] = "#2EFE2E"; 
			} else {
				three["colour"] = "#2E64FE"; 
			}
			two["children"].push(three);

		});

		console.log(array);

		//setTimeout(function() {
			console.log('pinto');
			updateWheel(JSON.stringify(array));
		//},300);

		return;

		// Coffee Flavour Wheel by Jason Davies,
		// http://www.jasondavies.com/coffee-wheel/
		// License: http://www.jasondavies.com/coffee-wheel/LICENSE.txt
		var nodes;

		function updateWheel(jsonString) {

			var width = 460,
				height = 460,
				radius = Math.min(width, height) / 2,
				x = d3.scale.linear().range([0, 2 * Math.PI]),
				y = d3.scale.pow().exponent(1.3).domain([0, 1]).range([0, radius]),
				padding = 5,
				duration = 2000;
		
			d3.select('#'+id).select('svg').remove();
			d3.select('#'+id).select('#tooltip_wheel').remove();
			
			var div = d3.select('#'+id);
			div.attr("align", "center");
		
		
			var vis = div.append("svg")
				.attr("width", width + padding * 2)
				.attr("height", height + padding * 2)
				.append("g")
				.attr("transform", "translate(" + [radius + padding, radius + padding] + ")");
		
		
			var partition = d3.layout.partition()
				.sort(null)
				.value(function(d) { return 5.8 - d.depth; });
		
			var arc = d3.svg.arc()
				.startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
				.endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
				.innerRadius(function(d) { return Math.max(0, d.y ? y(d.y) : d.y); })
				.outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });
		
			var json = JSON.parse(jsonString);
			/// d3.json(jsonString, function(json) {
			nodes = partition.nodes({children: json});
		
			var path = vis.selectAll("path").data(nodes);
			path.enter().append("path")
				.attr("id", function(d, i) { return "path-" + i; })
				.attr("d", arc)
				.attr("fill-rule", "evenodd")
				.style("fill", colour)
				.style("stroke", "#000")
				.on("click", click).on("mouseover",mouseover);
		
			var text = vis.selectAll("text").data(nodes);
			  
			var textEnter = text.enter().append("text")
				.style("fill-opacity", 1)
				.style("fill", function(d) {
					return brightness(d3.rgb(colour(d))) < 125 ? "#eee" : "#000";
				})
			.attr("text-anchor", function(d) {
				return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
			})
			.attr("dy", ".2em")
			.attr("transform", function(d) {
				var multiline = (d.name || "").split(" ").length > 1,
					angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
					rotate = angle + (multiline ? -.5 : 0);
				return "rotate(" + rotate + ")translate(" + (y(d.y) + padding) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
			})
			.on("click", click).on("mouseover",mouseover);
  
			textEnter.append("tspan")
				.attr("x", 0)
				.text(function(d) { 
					if (d.depth == 3)
						//return d.depth ? d.name.split(" ")[0] : ""; 
						return "";
					else 
						return d.depth ? d.name.split(" ")[0] : "";
				});

			function mouseover(d) {
				if(d.depth == 3){
					$("#tooltip_wheel").remove();
					$('#'+id).append('<div id="tooltip_wheel"></div>');
					$("#tooltip_wheel").append(d.name);
					if (d.parent.name == "Positive") {
						$("#tooltip_wheel").css("background-color", "#2EFE2E")
					} else if (d.parent.name == "Negative") {
						$("#tooltip_wheel").css("background-color", "#FE2E2E")
					}
				}
			}

			function click(d) {
			  	if(d.depth < 3){			
					path.transition()
					  .duration(duration)
					  .attrTween("d", arcTween(d));
					console.log("pinchando en:"+d.name);
					// Somewhat of a hack as we rely on arcTween updating the scales.
					text.style("visibility", function(e) {
						  return isParentOf(d, e) ? null : d3.select(this).style("visibility");
						})
					  .transition()
						.duration(duration)
						.attrTween("text-anchor", function(d) {
						  return function() {
							return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
						  };
						})
						.attrTween("transform", function(d) {
						  var multiline = (d.name || "").split(" ").length > 1;
						  return function() {
							var angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
								rotate = angle + (multiline ? -.5 : 0);
							return "rotate(" + rotate + ")translate(" + (y(d.y) + padding) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
						  };
						})
						.style("fill-opacity", function(e) { return isParentOf(d, e) ? 1 : 1e-6; })
						.each("end", function(e) {
						  d3.select(this).style("visibility", isParentOf(d, e) ? null : "hidden");
						});
				}
			}

			function isParentOf(p, c) {
				if (p === c) return true;
				if (p.children) {
					return p.children.some(function(d) {
				  		return isParentOf(d, c);
					});
			  	}
				return false;
			}

			function colour(d) {
				// console.log(d);
				if (d.colour != undefined) {
					return d.colour;
				} else {
					switch (d.depth) {
						case 0: 
							return "#012DAC";
						case 1:
							return "#0141F8";
						case 2:
							return "#2E64FE";
						case 3:
							return "#7A9DFE";
					}
				}
				return "#FFF";

				// if (d.children) {
				// 	// There is a maximum of two children!
				// 	var colours = d.children.map(colour),
				// 		a = d3.hsl(colours[0]),
				// 		b = d3.hsl(colours[1]);
						
				// 	// L*a*b* might be better here...
				// 	return d3.hsl((a.h + b.h) / 2, a.s * 1.2, a.l / 1.2);
				// }
				// return d.colour || "#fff";

				switch (d.depth) {
					case 0: 
						return "#012DAC";
					case 1:
						return "#0141F8";
					case 2:
						return "#2E64FE";
					case 3:
						return "#7A9DFE";
				}
				return "#FFF";
				
			}

			// Interpolate the scales!
			function arcTween(d) {
				var my = maxY(d),
					xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
					yd = d3.interpolate(y.domain(), [d.y, my]),
					yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
				return function(d) {
					return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
				};
			}

			function maxY(d) {
				return d.children ? Math.max.apply(Math, d.children.map(maxY)) : d.y + d.dy;
			}

			// http://www.w3.org/WAI/ER/WD-AERT/#color-contrast
			function brightness(rgb) {
				return rgb.r * .299 + rgb.g * .587 + rgb.b * .114;
			}


			function clickWithName(name) {
				for (var i=0; i < nodes.length; i++) {
					if (nodes[i].name == name) {
						console.log("knockout filter to wheel click");
						console.log(nodes[i]);
					}
				}
			}

		}
	}
};