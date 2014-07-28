// New widget
var newWidget = {
	// Widget name.
	name: "Nname",
	// Widget description.
	description: "description",
	// Path to the image of the widget.
	img: "path/to/image",
	// Type of the widget.
	type: "type",
	// Help display on the widget
	help: "help",
	// Category of the widget (1: textFilter, 2: numericFilter, 3: graph, 5:results, 4: other, 6:map)
	cat: X,

	render: function () {
		var id = 'A' + Math.floor(Math.random() * 10001);
		var field = newWidget.field || "";
		vm.activeWidgetsRight.push({"id":ko.observable(id),"title": ko.observable(newWidget.name), "type": ko.observable(newWidget.type), "field": ko.observable(field),"collapsed": ko.observable(false), "showWidgetHelp": ko.observable(false), "help": ko.observable(newWidget.help)});
		
		newWidget.paint(id);	
	},

	paint: function (id) {
		d3.select('#' + id).selectAll('div').remove();
		var div = d3.select('#' + id);
		div.attr("align", "center");

		// Code
	}
};