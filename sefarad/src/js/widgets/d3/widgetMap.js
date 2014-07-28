// New widget
var widgetMap = {
	// Widget name.
	name: "Map",
	// Widget description.
	description: "Mapa. Muestra los valores 'latitude' y 'longitude'",
	// Path to the image of the widget.
	img: "img/widgets/widgetMap.png",
	// Type of the widget.
	type: "widgetMap",
	// Help display on the widget
	help_en: "Help map",
	help_es: "Ayuda",
	// Category of the widget (1: textFilter, 2: numericFilter, 3: graph, 5:results, 4: other, 6:map)
	cat: 6,

	render: function () {
		var id = 'A' + Math.floor(Math.random() * 10001);
		var field = widgetMap.field || "";
		vm.activeWidgetsRight.push({"id":ko.observable(id),
									"title": ko.observable(widgetMap.name), 
									"type": ko.observable(widgetMap.type), 
									"help_en": ko.observable(widgetMap.help_en),
									"help_es": ko.observable(widgetMap.help_es), 
									"field": ko.observable(widgetMap.field),
									"collapsed": ko.observable(false), 
									"showWidgetHelp":ko.observable(false)});
		
		widgetMap.paint(id);	
	},

	// paint: function (field, id, type) {	
	paint: function (id) {
		d3.select('#' + id).selectAll('div').remove();
		var div = d3.select('#' + id);
		div.attr("align", "center");

		//Elementos a mostrar en el mapa
		if(vm.sparql){
			data = vm.shownSparqlData();
		}else{
			data = vm.shownData();
		}

		//Creamos mapa
		var map_div = div.append("div")
			.attr("id", "map")
			.attr("class", "map");

		var myCenter = new google.maps.LatLng(40.42761, -3.703187);

		var mapProperties = {
			center: myCenter,
			zoom: 5,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};

		var map = new google.maps.Map(map_div.node(), mapProperties);

		var bounds = new google.maps.LatLngBounds();

		//Añadimos markers con las ciudades filtradas
		$.each(data, function (index, item) {
			if (!vm.sparql()) {
				var marker = new google.maps.Marker({
					position: new google.maps.LatLng(item.latitude(), item.longitude()),
					title: item.nombre().toString(),
					map: map,
				});

				//Ventana de info cuando clicamos el marker
				var contentString = '<div id="content">' + item.pais().toString() + '</div>';
			} else {
					var marker = new google.maps.Marker({
					position: new google.maps.LatLng(item.latitude.value(), item.longitude.value()),
					title: item.university.value().toString(),
					map: map,
				});

				//Ventana de info cuando clicamos el marker
				var contentString = '<div id="content">' + item.country.value().toString() + '</div>';
			}

			var infowindow = new google.maps.InfoWindow({
				content: contentString
			});

			google.maps.event.addListener(marker, "click", function () {
				infowindow.open(map, marker);
			});

			//Añadimos a bound para re-centrar todos los marcadores
			bounds.extend(marker.position);

		});

		map.fitBounds(bounds);
	}
};