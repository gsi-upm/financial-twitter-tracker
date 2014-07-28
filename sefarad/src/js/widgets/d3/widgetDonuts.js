// New widget
var widgetDonuts = {
		// Widget name.
		name: "Widget Donuts",
		// Widget description.
		description: "Widget Donuts",
		// Path to the image of the widget.
		img: "img/widgets/widgetDonuts.png",
		// Type of the widget.
		type: "widgetDonuts",
		// Help display on the widget
		help_en: "Help of Donuts",
		help_es: "Ayuda",
		// [OPTIONAL] data taken from this field.
		// field: "polarityValue",
		// Category of the widget (1: textFilter, 2: numericFilter, 3: graph, 5:results)
		cat: 3,


		render: function () {
			var id = 'A' + Math.floor(Math.random() * 10001);
			var field = widgetDonuts.field || "";
			vm.activeWidgetsRight.push({"id":ko.observable(id),
										"title": ko.observable(widgetDonuts.name), 
										"type": ko.observable(widgetDonuts.type), 
										"help_en": ko.observable(widgetDonuts.help_en), 
										"help_es": ko.observable(widgetDonuts.help_es),
										"field": ko.observable(widgetDonuts.field),
										"collapsed": ko.observable(false), 
										"showWidgetHelp":ko.observable(false)});
			
			widgetDonuts.paint(id);
		},

		paint: function (id) {			
			
			d3.select('#'+id).selectAll('svg').remove();
			var div = d3.select('#'+id);
			div.attr("align", "center");	

			// Create configuration section
			$('#'+id).append("<div></div>");
			$('#' + id + ' > div').addClass('widget-configuration');

			valorSeleccionado = stockWidget.options[id];

			for (i=0; i<vm.dataColumns.length; i++) {
				$('#' + id + ' > div').append('<input type="radio" name="group' + id + '" value="' + vm.dataColumns()[2] + '">' + vm.dataColumns()[2] + '</input>');
			}

			$('input:radio').on('change', function(){
				valorSeleccionado = $('input:radio[name=group' + id + ']:checked').val();
				stockWidget.options[id] = valorSeleccionado;
				stockWidget.paint(id)
			});

			if (stockWidget.options[id] != undefined) {
				$('#'+id).append('<div id="tooltip">' + stockWidget.options[id].toUpperCase() + '</div>');
				$('input[name="group' + id + '"][value="' + stockWidget.options[id] + '"]').prop('checked', true);
			} else {
				$('#'+id).append('<div id="tooltip"></div>');
				$("#" + id + " > #tooltip").append("Not options selected");
				return;
			}

			//Create donuts
			var data = new Array();
			
			$.each(vm.filteredData(), function(index, item) {

				var bank = new Object();
				bank.organization = item.organization();
				bank.employees = item.employees();
				bank.managers = item.managers();

				data.push(bank);					
					
			});	

			var radius = 74,
			    padding = 10;

			var color = d3.scale.ordinal()
			    .range(["#98abc5", "#ff8c00"])
			    .domain(d3.keys(data[0]).filter(function(key) { return key !== "organization"; }));

			var arc = d3.svg.arc()
			    .outerRadius(radius)
			    .innerRadius(radius - 30);

			var pie = d3.layout.pie()
			    .sort(null)
			    .value(function(d) { return d.number; });

			data.forEach(function(d) {
			    d.ranges = color.domain().map(function(name) {
			      return {name: name, number: +d[name]};
			    });
			});

			var legend = div.append("svg")
			      .attr("class", "legend")
			      .attr("width", radius * 2 + padding)
			      .attr("height", radius * 2 + padding)
			    .selectAll("g")
			      .data(color.domain().slice().reverse())
			    .enter().append("g")
			      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

			legend.append("rect")
			      .attr("width", 18)
			      .attr("height", 18)
			      .style("fill", color)
			      .attr("transform", "translate(" + padding + "," + padding + ")");

			legend.append("text")
			      .attr("x", 24)
			      .attr("y", 9)
			      .attr("dy", ".35em")
			      .text(function(d) { return d; })
			      .attr("transform", "translate(" + padding + "," + padding + ")");

			var svg = div.selectAll(".pie")
			      .data(data)
			    .enter().append("svg")
			      .attr("class", "pie")
			      .attr("width", radius * 2 + padding)
			      .attr("height", radius * 2 + padding)
			    .append("g")
			      .attr("transform", "translate(" + [radius + padding, radius + padding] + ")");

			svg.selectAll(".arc")
			      .data(function(d) { return pie(d.ranges); })
			    .enter().append("path")
			      .attr("class", "arc")
			      .attr("d", arc)	
			      .style("fill", function(d) { return color(d.data.name); });

			svg.append("text")
			      .attr("dy", ".35em")
			      .style("text-anchor", "middle")
			      .text(function(d) { return d.organization; });

		}
};	