// New widget
var stock_sentiment_widget = {
		// Widget name.
		name: "Sentiment Widget",
		// Widget description.
		description: "Sentiment visualizer",
		// Path to the image of the widget.
		img: "img/widgets/stockWidget.png",
		// Type of the widget.
		type: "sentimentWidget",
		// Help text
		help_en: "Help",
		help_es: "Ayuda",
		// [OPTIONAL] data taken from this field.
		// field: "polarityValue",
		// Category of the widget (1: textFilter, 2: numericFilter, 3: graph, 5:results)
		cat: 3,


		render: function () {
			var id = 'A' + Math.floor(Math.random() * 10001);
			var field = stock_sentiment_widget.field || "";
			vm.activeWidgetsRight.push({"id":ko.observable(id),
										"title": ko.observable(stock_sentiment_widget.name), 
										"type": ko.observable(stock_sentiment_widget.type),
										"help_en": ko.observable(stock_sentiment_widget.help_en),
										"help_es": ko.observable(stock_sentiment_widget.help_es),
										"field": ko.observable(field),
										"collapsed": ko.observable(false),
										"showWidgetHelp":ko.observable(false)});

			// stockWidget.paint(field, id, stockWidget.type);
			stock_sentiment_widget.paint(id);
		},

		options: {

		},


		paint: function (id) {
			$('#' + id).empty();	
			valoresSeleccionados = []
			$.each(vm.activeWidgets(), function (index, item) {
				if (item.type() == 'tagcloud' && item.field() == 'entity') {
					for (var i = 0; i < item.values().length; i++) {
						if (item.values()[i]['state']()) {
							valoresSeleccionados.push(item.values()[i]['name']())
						}
					}
				}
			});
			console.log(valoresSeleccionados.length == 0);

			if (valoresSeleccionados.length == 0) {
				$('#'+id).append('<div id="tooltip"></div>');
				$("#" + id + " > #tooltip").append("<span class='help_es'>Ninguna entidad seleccionada.</span><span class='help_en'>No entity selected.</span>");
				lang_onchange();
				return;
			}

			console.log (valoresSeleccionados)

			valoresSeleccionadosCopy = valoresSeleccionados.slice();
			valoresSeleccionados = []

			console.log(valoresSeleccionadosCopy);

			for (var ii = 0; ii < valoresSeleccionadosCopy.length; ii++) {
				valor = valoresSeleccionadosCopy[ii]
				console.log(valor)

				switch (valor){
					case 'Apple':
						valoresSeleccionados.push('aapl');
						break;
					case 'Google':
						valoresSeleccionados.push('goog');
						break;
					case 'Amazon':
						valoresSeleccionados.push('amzn');
						break;
					case 'Santander':
						valoresSeleccionados.push('san_en');
						break;
					case 'Telefonica':
						valoresSeleccionados.push('tef_en');
						break;
					case 'Iberdrola':
						valoresSeleccionados.push('ibe_en');
						break;
					case 'Vodafone':
						valoresSeleccionados.push('vod_en');
						break;
				}
			}

			lang_onchange();

			companies = valoresSeleccionados;

			data_string = '';

			for (var i = 0; i < companies.length; i++) {
				console.log(i)
				data_string += 'company' + (1+i) + '=' + companies[i] + '&';
			}

			data_string += 'number=' + companies.length;

			$.ajax({
				type: "GET",
				url: '/ftt/php/mongo_sentiment.php',
				data: data_string,

				beforeSend: function (xhr) {
						
				},
				success: function (data) {
					// console.log(data)
					// console.log(data.split('\n'))
					// stock_sentiment_widget.options.aapl = [];
					data = data.split('\n');
					console.log(data.length)
					for (var i = 0; i < data.length-1; i++) {

						data_company = JSON.parse(data[i])
						console.log(data_company)
						key = Object.keys(data_company)[0]
						console.log(key)
						// console.log(data[i]);
						// console.log('\n\n');
						stock_sentiment_widget.options[key] = data_company[key]
						// stock_sentiment_widget.append(data[key][0]);
					}
					stock_sentiment_widget.paint_2(id, companies);
					// console.log(data[0])
					// data = JSON.parse(data[0])
					// console.log(data['anger'])
					// console.log('findata')
				},
				error: function () {
					alert("Error reseting configuration");	
				}
			});

		},

		paint_2: function (id, companies) {
			$('#' + id).empty();	

			// d3.select('#'+id).select('svg').remove();
			// d3.select('#'+id).select('#tooltip').remove();

			sentimentValue = {}
			historicos = {}
			for (var i = 0; i < companies.length; i++) {
				sentimentValue[companies[i]] = {};
				historicos[companies[i]] = [];

				for (var j = 0; j < stock_sentiment_widget.options[companies[i]].length; j++) {
					data = stock_sentiment_widget.options[companies[i]][j];
					// console.log(data)
					t = new Date(1970,0,1);
					t.setSeconds(data['date']['sec']);
					fecha = t.getFullYear() + '-' + (t.getMonth()+1) + '-' + t.getDate();

					if (companies[i] == 'aapl' || companies[i] == 'goog' || companies[i] == 'amzn') {						
						sentiment = data['140']['pos'] - data['140']['neg'];
					} else {
						sentiment = data['paradigma']['pos'] - data['paradigma']['neg']
					}

					if (sentiment == NaN) {
						console.log
						sentiment = 0;
					}

					price = data['price'];

					sentimentValue[companies[i]][fecha] = sentiment;
					historicos[companies[i]].push([fecha, price]);
				}
			}



			// for (var i = 0; i < stock_sentiment_widget.options.aapl.length; i++) {
			// 	data = stock_sentiment_widget.options.aapl[i];
			// 	// console.log(data)
			// 	t = new Date(1970,0,1);
			// 	t.setSeconds(data['date']['sec']);
			// 	fecha = t.getUTCFullYear() + '-' + (t.getMonth()+1) + '-' + t.getDate();
			// 	sentiment = data['140']['pos'] - data['140']['neg'];
			// 	if (sentiment == NaN) {
			// 		sentiment = 0;
			// 	}

			// 	sentimentValue.aapl[fecha] = sentiment
			// }

			console.log(sentimentValue);

			// historicos = {
			// 	'aapl': []
			// }


			// for (var i = 0; i < stock_sentiment_widget.options.aapl.length; i++) {
			// 	data = stock_sentiment_widget.options.aapl[i];

			// 	t = new Date(1970,0,1);
			// 	t.setSeconds(data['date']['sec']);
			// 	fecha = t.getUTCFullYear() + '-' + (t.getMonth()+1) + '-' + t.getDate();
			// 	price = data['price']

			// 	historicos.aapl.push([fecha, price])
			// }

			auxObject = {}
			auxData = {}

			valoresSeleccionados = companies;
			valoresSeleccionadosIP = []
			valoresSeleccionadosPT = []
			if (companies.indexOf('aapl') != -1) {
				valoresSeleccionadosIP.push('aapl')
			}
			if (companies.indexOf('amzn') != -1) {
				valoresSeleccionadosIP.push('amzn')
			}
			if (companies.indexOf('goog') != -1) {
				valoresSeleccionadosIP.push('goog')
			}
			if (companies.indexOf('ibe_en') != -1) {
				valoresSeleccionadosPT.push('ibe_en')
			}
			if (companies.indexOf('san_en') != -1) {
				valoresSeleccionadosPT.push('san_en')
			}
			if (companies.indexOf('tef_en') != -1) {
				valoresSeleccionadosPT.push('tef_en')
			}
			if (companies.indexOf('vod_en') != -1) {
				valoresSeleccionadosPT.push('vod_en')
			}

			for (var i = 0; i < valoresSeleccionadosIP.length; i++) {
				// console.warn(sentimentValue[valoresSeleccionados[i]])
				data = []
				historico = historicos[valoresSeleccionadosIP[i]]
				console.log(historico)

				for (var j = 0; j < historico.length; j++) {
					data[j] = new Object();
					data[j].price = historico[j][1]
					fecha = historico[j][0]
					// console.log(fecha)
					data[j].date = fecha
					if (sentimentValue[valoresSeleccionadosIP[i]][fecha] == undefined) {
						data[j].sentiment = 0
					} else {
						data[j].sentiment = sentimentValue[valoresSeleccionadosIP[i]][fecha]
					}
				}
				// console.log(valoresSeleccionados[i])
				auxData[valoresSeleccionadosIP[i]] = data
				console.log(data)

				var margin = {top: 10, right: 40, bottom:40, left: 60},
					width = $('#'+id).width() - margin.left - margin.right,
					height = 200 - margin.top - margin.bottom;

				var parseDate = d3.time.format("%Y-%m-%d").parse;

				var x = d3.time.scale().range([0, width]),
					y = d3.scale.linear().range([height, 0]),
					y2 = d3.scale.linear().range([height, 0]);

				var xAxis = d3.svg.axis().scale(x).orient("bottom"),
					yAxis = d3.svg.axis().scale(y).orient("left"),
					yAxis2 = d3.svg.axis().scale(y2).orient("right");

				var line = d3.svg.line()
					.interpolate("basis")
					.x(function(d) { return x(d.date); })
					.y(function(d) { return y(d.price); })

				var line2 = d3.svg.line()
					// .interpolate("basis")
					.x(function(d) { return x(d.date); })
					.y(function(d) { return y2(d.sentiment); })

				var svg = d3.select('#'+id).append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom);

				svg.append("text")
					.text(function () {
						text_graph = valoresSeleccionadosIP[i]
						switch (text_graph) {
							case 'amzn':
								return 'Amazon';
								break;
							case 'aapl':
								return 'Apple';
								break;
							case 'goog':
								return 'Google';
								break;
						}
					})
					.attr("x", -height/2)
					.attr("y", 25)
					.attr("transform", "rotate(-90)")
					.attr("font-family", "sans-serif")
					.attr("font-size", "20px")
					.attr("text-anchor", "middle")
				
				svg.append("defs").append("clipPath")
					.attr("id", "clip")
					.append("rect")
					.attr("width", width)
					.attr("height", height);
			
				var focus = svg.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				var sentiment = svg.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				data.forEach(function(d) {
					d.date = parseDate(d.date);
					d.price = +d.price;
				});

				x.domain(d3.extent(data.map(function(d) { return d.date; })));
				y.domain([d3.min(data.map(function(d) { return d.price; })), d3.max(data.map(function(d) { return d.price; }))]);
				y2.domain([d3.min(data.map(function(d) { return d.sentiment; })), d3.max(data.map(function(d) { return d.sentiment; }))]);

				console.log(d3.extent(data.map(function(d) { return d.date; })));
				console.log(d3.min(data.map(function(d){return d.date})));

				focus.append("path")
					.datum(data)
					.attr("clip-path", "url(#clip)")
					.attr("stroke", "steelblue")
					.attr("stroke-width", 2)
					.attr("fill", "none")
					.attr("d", line);

				focus.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + height + ")")
					.call(xAxis);

				focus.append("g")
					.attr("class", "y axis")
					.call(yAxis);

				sentiment.append("path")
					.datum(data)
					.attr("clip-path", "url(#clip)")
					.attr("stroke", "black")
					.attr("stroke-width", 2)
					.attr("fill", "none")
					.attr("d", line2);

				sentiment.append("g")
					.attr("class", "y axis")
					.attr("transform", "translate(" + width + ", 0)")
					.call(yAxis2);

				auxObject[valoresSeleccionadosIP[i]] = {'focus': focus, 'sentiment': sentiment}

				if (i == valoresSeleccionadosIP.length-1) {

					var x2 = d3.time.scale().range([0, width]);
					x2.domain(x.domain());

					var xAxis2 = d3.svg.axis().scale(x2).orient("bottom");
					
					var brush = d3.svg.brush()
						.x(x2)
						.on("brush", brushed);

					var area2 = d3.svg.area()
						.interpolate("monotone")
						.x(function(d) { return x2(d.date); })
						.y0(70)
						.y1(function(d) { return 0; });

					var context = d3.select('#'+id).append("svg")
						.attr("width", width + margin.left + margin.right)
						.attr("height", 50)
						.append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

					context.append("rect")
						.attr("class", "grid-background")
						.attr("wdith", width)
						.attr("height", height);

					context.append("g")
						.attr("class", "x axis")
						.attr("transform", "translate(0," + 20 + ")")
						.call(xAxis2);

					context.append("g")
						.attr("class", "x brush")
						.call(brush)
						.selectAll("rect")
						.attr("y", -6)
						.attr("height", 20 + 6);

					function brushed() {
						x.domain(brush.empty() ? x2.domain() : brush.extent());

						for (var j = 0; j < valoresSeleccionadosIP.length; j++) {
							valor = valoresSeleccionadosIP[j]

							focus = auxObject[valor]['focus']
							sentiment = auxObject[valor]['sentiment']

							data = auxData[valoresSeleccionadosIP[j]]
							y.domain([d3.min(data.map(function(d) { return d.price; })), d3.max(data.map(function(d) { return d.price; }))]);

							y2.domain([d3.min(data.map(function(d) { return d.sentiment; })), d3.max(data.map(function(d) { return d.sentiment; }))]);


							focus.select("path").attr("d", line);
							sentiment.select("path").attr("d", line2);
							focus.select(".x.axis").call(xAxis);
						}
					}
				}
			}





			auxObject2 = {}
			auxData2 = {}

			for (var i = 0; i < valoresSeleccionadosPT.length; i++) {
				// console.warn(sentimentValue[valoresSeleccionados[i]])
				data = []
				historico = historicos[valoresSeleccionadosPT[i]]
				console.log(historico)

				for (var j = 0; j < historico.length; j++) {
					data[j] = new Object();
					data[j].price = historico[j][1]
					fecha = historico[j][0]
					// console.log(fecha)
					data[j].date = fecha
					if (sentimentValue[valoresSeleccionadosPT[i]][fecha] == undefined) {
						data[j].sentiment = 0
					} else {
						data[j].sentiment = sentimentValue[valoresSeleccionadosPT[i]][fecha]
					}
				}
				// console.log(valoresSeleccionados[i])
				auxData2[valoresSeleccionadosPT[i]] = data
				console.log(data)

				var margin = {top: 10, right: 40, bottom:40, left: 60},
					width = $('#'+id).width() - margin.left - margin.right,
					height = 200 - margin.top - margin.bottom;

				var parseDate = d3.time.format("%Y-%m-%d").parse;

				var x = d3.time.scale().range([0, width]),
					y = d3.scale.linear().range([height, 0]),
					y2 = d3.scale.linear().range([height, 0]);

				var xAxis = d3.svg.axis().scale(x).orient("bottom"),
					yAxis = d3.svg.axis().scale(y).orient("left"),
					yAxis2 = d3.svg.axis().scale(y2).orient("right");

				var line = d3.svg.line()
					.interpolate("basis")
					.x(function(d) { return x(d.date); })
					.y(function(d) { return y(d.price); })

				var line2 = d3.svg.line()
					// .interpolate("basis")
					.x(function(d) { return x(d.date); })
					.y(function(d) { return y2(d.sentiment); })

				var svg = d3.select('#'+id).append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom);

				svg.append("text")
					.text(function () {
						text_graph = valoresSeleccionadosPT[i]
						switch (text_graph) {
							case 'ibe_en':
								return 'Iberdrola';
								break;
							case 'san_en':
								return 'Santander';
								break;
							case 'tef_en':
								return 'Telefonica';
								break;
							case 'vod_en':
								return 'Vodafone';
								break;
						}
					})
					.attr("x", -height/2)
					.attr("y", 25)
					.attr("transform", "rotate(-90)")
					.attr("font-family", "sans-serif")
					.attr("font-size", "20px")
					.attr("text-anchor", "middle")
				
				svg.append("defs").append("clipPath")
					.attr("id", "clip")
					.append("rect")
					.attr("width", width)
					.attr("height", height);
			
				var focus = svg.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				var sentiment = svg.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				data.forEach(function(d) {
					d.date = parseDate(d.date);
					d.price = +d.price;
				});

				x.domain(d3.extent(data.map(function(d) { return d.date; })));
				y.domain([d3.min(data.map(function(d) { return d.price; })), d3.max(data.map(function(d) { return d.price; }))]);
				y2.domain([d3.min(data.map(function(d) { return d.sentiment; })), d3.max(data.map(function(d) { return d.sentiment; }))]);

				console.log(d3.extent(data.map(function(d) { return d.date; })));
				console.log(d3.min(data.map(function(d){return d.date})));

				focus.append("path")
					.datum(data)
					.attr("clip-path", "url(#clip)")
					.attr("stroke", "steelblue")
					.attr("stroke-width", 2)
					.attr("fill", "none")
					.attr("d", line);

				focus.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + height + ")")
					.call(xAxis);

				focus.append("g")
					.attr("class", "y axis")
					.call(yAxis);

				sentiment.append("path")
					.datum(data)
					.attr("clip-path", "url(#clip)")
					.attr("stroke", "black")
					.attr("stroke-width", 2)
					.attr("fill", "none")
					.attr("d", line2);

				sentiment.append("g")
					.attr("class", "y axis")
					.attr("transform", "translate(" + width + ", 0)")
					.call(yAxis2);

				auxObject2[valoresSeleccionadosPT[i]] = {'focus': focus, 'sentiment': sentiment}

				if (i == valoresSeleccionadosPT.length-1) {

					var x22 = d3.time.scale().range([0, width]);
					x22.domain(x.domain());

					var xAxis2 = d3.svg.axis().scale(x22).orient("bottom");
					
					var brush2 = d3.svg.brush()
						.x(x22)
						.on("brush", brushed2);

					var area2 = d3.svg.area()
						.interpolate("monotone")
						.x(function(d) { return x22(d.date); })
						.y0(70)
						.y1(function(d) { return 0; });

					var context = d3.select('#'+id).append("svg")
						.attr("width", width + margin.left + margin.right)
						.attr("height", 50)
						.append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

					context.append("rect")
						.attr("class", "grid-background")
						.attr("wdith", width)
						.attr("height", height);

					context.append("g")
						.attr("class", "x axis")
						.attr("transform", "translate(0," + 20 + ")")
						.call(xAxis2);

					context.append("g")
						.attr("class", "x brush")
						.call(brush2)
						.selectAll("rect")
						.attr("y", -6)
						.attr("height", 20 + 6)
						.attr("stroke", "black");

					function brushed2() {
						x.domain(brush2.empty() ? x22.domain() : brush2.extent());

						for (var j = 0; j < valoresSeleccionadosPT.length; j++) {
							valor = valoresSeleccionadosPT[j]

							focus2 = auxObject2[valor]['focus']
							sentiment2 = auxObject2[valor]['sentiment']

							data = auxData2[valoresSeleccionadosPT[j]]
							y.domain([d3.min(data.map(function(d) { return d.price; })), d3.max(data.map(function(d) { return d.price; }))]);
							
							y2.domain([d3.min(data.map(function(d) { return d.sentiment; })), d3.max(data.map(function(d) { return d.sentiment; }))]);

							focus2.select("path").attr("d", line);
							sentiment2.select("path").attr("d", line2);
							focus2.select(".x.axis").call(xAxis);
						}
					}
				}
			}

		}
		
	};