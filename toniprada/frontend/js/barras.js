//var data = [-0.4, -0.1, -1, 0.3, 0.2, 0.6, -0.6, -0.8, 0.2, 0.6, 0.3, 0.2, 0.6, -0.6, -0.8, 0.2, 0.6];


 $.ajax({
    url: 'script_conversorBarras.php',
    type: "GET",
    dataType: "json",
    async:false,
    success: function (datos) {
		 console.log("datosss barras OK");
         pintaGrafico(datos);
    },
    error: function () {
         console.log("datosss barras NOK");
    }
});




function updateBarras(datos){
	$("#barras").empty();
	var data = JSON.parse(datos);
	//var data = datos;
	var margin1 = {top: 30, right: 10, bottom: 10, left: 10},
		width1 = 700 - margin1.left - margin1.right,
		height1 = 30*data.length - margin1.top - margin1.bottom;

	var x0 = Math.max(-d3.min(data), d3.max(data));

	var x1 = d3.scale.linear()
		.domain([-x0, x0])
		.range([0, width1])
		.nice();

	var y1 = d3.scale.ordinal()
		.domain(d3.range(data.length))
		.rangeRoundBands([0, height1], .2);

	var xAxis = d3.svg.axis()
		.scale(x1)
		.orient("top");

	var svg = d3.select("#barras").append("svg")
		.attr("width", width1 + margin1.left + margin1.right)
		.attr("height", height1 + margin1.top + margin1.bottom)
	  .append("g")
		.attr("transform", "translate(" + margin1.left + "," + margin1.top + ")");

	svg.selectAll(".bar")
		.data(data)
	  .enter().append("rect")
		.attr("class", function(d) { return d < 0 ? "bar negative" : "bar positive"; })
		.attr("x", function(d) { return x1(Math.min(0, d)); })
		.attr("y", function(d, i) { return y1(i); })
		.attr("width", function(d) { return Math.abs(x1(d) - x1(0)); })
		.attr("height", y1.rangeBand());

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
