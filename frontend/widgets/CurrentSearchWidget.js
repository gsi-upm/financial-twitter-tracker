(function ($) {

AjaxSolr.CurrentSearchWidget = AjaxSolr.AbstractWidget.extend({
  start: 0,

  afterRequest: function () {
    var self = this;
    var links = [];

    var q = this.manager.store.get('q').val();
    if (q != '*:*') {
      links.push($('<a href="#"/>').text('(x) ' + q).click(function () {
        self.manager.store.get('q').val('*:*');
        self.doRequest();
        return false;
      }));
    }

    var fq = this.manager.store.values('fq');
    for (var i = 0, l = fq.length; i < l; i++) {
      links.push($('<a href="#"/>').text('(x) ' + fq[i]).click(self.removeFacet(fq[i])));
    }

    if (links.length > 1) {
      links.unshift($('<a href="#"/>').text('Borrar todo').click(function () {
        self.manager.store.get('q').val('*:*');
        self.manager.store.remove('fq');
        self.doRequest();
        return false;
      }));
    }

    if (links.length) {
      AjaxSolr.theme('list_items', this.target, links);
    }
    else {
      $(this.target).html('<div>No hay filtro aplicado</div>');
    }
  },

  removeFacet: function (facet) {
    var self = this;
    return function () {
	//console.log("Facet eliminada: " + facet);
      if (self.manager.store.removeByValue('fq', facet)) {
        self.doRequest();
		resetGraficoCircular();	
    
      }
      return false;
    };
  }
});

})(jQuery);


function resetGraficoCircular(){
  $('#vis').empty();	

		var div = d3.select("#vis");
		div.select("img").remove();

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

			
		d3.json("http://localhost/ftt/Visualizador3/script_conversorWheel.php", function(json) {
		  var nodes = partition.nodes({children: json});

		  var path = vis.selectAll("path").data(nodes);
		  path.enter().append("path")
			  .attr("id", function(d, i) { return "path-" + i; })
			  .attr("d", arc)
			  .attr("fill-rule", "evenodd")
			  .style("fill", colour)
			  .on("click", click);

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
			  .on("click", click);
			  
			  
			 textEnter.append("tspan")
			  .attr("x", 0)
			  .text(function(d) { 
					if (d.depth == 3)
						//return d.depth ? d.name.split(" ")[0] : ""; 
						return "";
					else 
						return d.depth ? d.name.split(" ")[0] : "";
				});	
			
			
			 
			/*textEnter.append("tspan")
			  .attr("x", 0)
			  .attr("dy", "1em")
			  .text(function(d) { return d.depth ? d.name.split(" ")[1] || "" : ""; });*/
			
		  function click(d) {
			path.transition()
			  .duration(duration)
			  .attrTween("d", arcTween(d));

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
		  
		  
		});
		
		$('#vis').fadeIn('fast');	
		
		$('#barras').empty();	
		$.ajax({
			url: 'http://localhost/ftt/Visualizador3/script_conversorBarras.php',
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
		$('#barras').fadeIn('fast');	
	}
