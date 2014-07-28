// New widget
var widgetSortBar = {
		// Widget name.
		name: "Barras ordenadas",
		// Widget description.
		description: "Widget de barras ordenadas de mayor a menor",
		// Path to the image of the widget.
		img: "img/widgets/widgetSortBar.png",
		// Type of the widget.
		type: "widgetSortBar",
		// Help display on the widget
		help_en: "Help",
		help_es: "Ayuda",
		// [OPTIONAL] data taken from this field.
		// field: "polarityValue",
		// Category of the widget (1: textFilter, 2: numericFilter, 3: graph, 5:results)
		cat: 3,


		render: function () {
			var id = 'A' + Math.floor(Math.random() * 10001);
			var field = widgetSortBar.field || "";
			vm.activeWidgetsRight.push({"id":ko.observable(id),
										"title": ko.observable(widgetSortBar.name), 
										"type": ko.observable(widgetSortBar.type), 
										"help_en": ko.observable(widgetSortBar.help_en), 
										"help_es": ko.observable(widgetSortBar.help_es),
										"field": ko.observable(widgetSortBar.field),
										"collapsed": ko.observable(false), 
										"showWidgetHelp":ko.observable(false)});
			
			widgetSortBar	.paint(id);
		},

		// paint: function (field, id, type) {	
		paint: function (id) {	

			d3.select('#'+id).selectAll('svg').remove();
			var div = d3.select('#'+id);
			div.attr("align", "center");

			var data = new Array();
			
			$.each(vm.filteredData(), function(index, item) {

				var bank = new Object();
				bank.organization = item.organization();
				bank.employees = item.employees();

				data.push(bank);					
					
			});

			var margin = {top: 20, right: 20, bottom: 30, left: 40},
			    width = 700 - margin.left - margin.right,
			    height = 365 - margin.top - margin.bottom;

			var x = d3.scale.ordinal()
			    .rangeRoundBands([0, width], .1)
			    .domain(data.map(function(d) { return d.organization; }));

			var y = d3.scale.linear()
			    .range([height, 0])			    
			    .domain([0, d3.max($.map(data, function(d) { return d.employees; }))]); 
			    
			var xAxis = d3.svg.axis()
			    .scale(x)
			    .orient("bottom");

			var yAxis = d3.svg.axis()
			    .scale(y)
			    .orient("left");
		
			var svg = div.append("svg")
			    .attr("width", width + margin.left + margin.right)
			    .attr("height", height + margin.top + margin.bottom)
			  .append("g")
			    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			svg.append("g")
			      .attr("class", "x axis")
			      .attr("transform", "translate(0," + height + ")")
			      .call(xAxis);

			svg.append("g")
			      .attr("class", "y axis")
			      .call(yAxis)
			    .append("text")
			      .attr("x", 70)
			      .attr("y", -20)
			      .attr("dy", ".71em")
			      .style("text-anchor", "end")
			      .text("Empleados");
			svg.selectAll(".bar")
			      .data(data)
			    .enter().append("rect")
			      .attr("class", "bar")
			      .attr("x", function(d) { return x(d.organization); })
			      .attr("width", x.rangeBand())
			      .attr("y", function(d) { return y(d.employees); })
			      .attr("height", function(d) { return height - y(d.employees); });


				var sortTimeout = setTimeout(function() {
			  d3.select("input").property("checked", true).each(change);
			}, 100);

			function change() {
			  clearTimeout(sortTimeout);

		    // Copy-on-write since tweens are evaluated after a delay.
			    var x0 = x.domain(data.sort(this.checked
			        ? function(a, b) { return b.employees - a.employees; }
			        : function(a, b) { return d3.ascending(a.organization, b.organization); })
			        .map(function(d) { return d.organization; }))
			        .copy();

			    var transition = svg.transition().duration(500),
			        delay = function(d, i) { return i * 50; };

			    transition.selectAll(".bar")
			        .delay(delay)
			        .attr("x", function(d) { return x0(d.organization); });

			    transition.select(".x.axis")
			        .call(xAxis)
			      .selectAll("g")
			        .delay(delay);
			}			
		}
};	