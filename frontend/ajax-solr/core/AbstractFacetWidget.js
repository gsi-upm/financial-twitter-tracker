// $Id$

var active_orfilter = [];

/**
 * Baseclass for all facet widgets.
 *
 * @class AbstractFacetWidget
 * @augments AjaxSolr.AbstractWidget
 */
AjaxSolr.AbstractFacetWidget = AjaxSolr.AbstractWidget.extend(
  /** @lends AjaxSolr.AbstractFacetWidget.prototype */
  {
  /**
   * This widget will by default set the offset parameter to 0 on each request.
   */
  start: 0,

  /**
   * The field to facet on.
   *
   * @field
   * @public
   * @type String
   */
  field: null,

  /**
   * Set to <tt>false</tt> to force a single "fq" parameter for this widget.
   *
   * @field
   * @public
   * @type Boolean
   * @default true
   */
  multivalue: true,

  init: function () {
    this.initStore();
  },

  /**
   * Add facet parameters to the parameter store.
   */
  initStore: function () {
    /* http://wiki.apache.org/solr/SimpleFacetParameters */
    var parameters = [
      'facet.prefix',
      'facet.sort',
      'facet.limit',
      'facet.offset',
      'facet.mincount',
      'facet.missing',
      'facet.method',
      'facet.enum.cache.minDf'
    ];

    this.manager.store.addByValue('facet', true);

    // Set facet.field, facet.date or facet.range to truthy values to add
    // related per-field parameters to the parameter store.
    if (this['facet.field'] !== undefined) {
      this.manager.store.addByValue('facet.field', this.field);
    }
    else if (this['facet.date'] !== undefined) {
      this.manager.store.addByValue('facet.date', this.field);
      parameters = parameters.concat([
        'facet.date.start',
        'facet.date.end',
        'facet.date.gap',
        'facet.date.hardend',
        'facet.date.other',
        'facet.date.include'
      ]);
    }
    else if (this['facet.range'] !== undefined) {
      this.manager.store.addByValue('facet.range', this.field);
      parameters = parameters.concat([
        'facet.range.start',
        'facet.range.end',
        'facet.range.gap',
        'facet.range.hardend',
        'facet.range.other',
        'facet.range.include'
      ]);
    }

    for (var i = 0, l = parameters.length; i < l; i++) {
      if (this[parameters[i]] !== undefined) {
        this.manager.store.addByValue('f.' + this.field + '.' + parameters[i], this[parameters[i]]);
      }
    }
  },

  /**
   * @returns {Boolean} Whether any filter queries have been set using this
   *   widget's facet field.
   */
  isEmpty: function () {
    return !this.manager.store.find('fq', new RegExp('^-?' + this.field + ':'));
  },

  /**
   * Sets the filter query.
   *
   * @returns {Boolean} Whether the selection changed.
   */
  set: function (value) {
    return this.changeSelection(function () {
      var a = this.manager.store.removeByValue('fq', new RegExp('^-?' + this.field + ':')),
          b = this.manager.store.addByValue('fq', this.fq(value));
      return a || b;
    });
  },

  /**
   * Adds a filter query.
   *
   * @returns {Boolean} Whether a filter query was added.
   */
  add: function (value) {
    return this.changeSelection(function () {
      return this.manager.store.addByValue('fq', this.fq(value));
    });
  },

  /**
   * Removes a filter query.
   *
   * @returns {Boolean} Whether a filter query was removed.
   */
  remove: function (value) {
    return this.changeSelection(function () {
      return this.manager.store.removeByValue('fq', this.fq(value));
    });
  },

  /**
   * Removes all filter queries using the widget's facet field.
   *
   * @returns {Boolean} Whether a filter query was removed.
   */
  clear: function () {
    return this.changeSelection(function () {
      return this.manager.store.removeByValue('fq', new RegExp('^-?' + this.field + ':'));
    });
  },

  /**
   * Helper for selection functions.
   *
   * @param {Function} Selection function to call.
   * @returns {Boolean} Whether the selection changed.
   */
  changeSelection: function (func) {
    changed = func.apply(this);
    if (changed) {
      this.afterChangeSelection();
    }
    return changed;
  },

  /**
   * An abstract hook for child implementations.
   *
   * <p>This method is executed after the filter queries change.</p>
   */
  afterChangeSelection: function () {},

  /**
   * One of "facet.field", "facet.date" or "facet.range" must be set on the
   * widget in order to determine where the facet counts are stored.
   *
   * @returns {Array} An array of objects with the properties <tt>facet</tt> and
   * <tt>count</tt>, e.g <tt>{ facet: 'facet', count: 1 }</tt>.
   */
  getFacetCounts: function () {
    var property;
    if (this['facet.field'] !== undefined) {
      property = 'facet_fields';
    }
    else if (this['facet.date'] !== undefined) {
      property = 'facet_dates';
    }
    else if (this['facet.range'] !== undefined) {
      property = 'facet_ranges';
    }
    if (property !== undefined) {
      switch (this.manager.store.get('json.nl').val()) {
        case 'map':
          return this.getFacetCountsMap(property);
        case 'arrarr':
          return this.getFacetCountsArrarr(property);
        default:
          return this.getFacetCountsFlat(property);
      }
    }
    throw 'Cannot get facet counts unless one of the following properties is set to "true" on widget "' + this.id + '": "facet.field", "facet.date", or "facet.range".';
  },

  /**
   * Used if the facet counts are represented as a JSON object.
   *
   * @param {String} property "facet_fields", "facet_dates", or "facet_ranges".
   * @returns {Array} An array of objects with the properties <tt>facet</tt> and
   * <tt>count</tt>, e.g <tt>{ facet: 'facet', count: 1 }</tt>.
   */
  getFacetCountsMap: function (property) {
    var counts = [];
    for (var facet in this.manager.response.facet_counts[property][this.field]) {
      counts.push({
        facet: facet,
        count: parseInt(this.manager.response.facet_counts[property][this.field][facet])
      });
    }
    return counts;
  },

  /**
   * Used if the facet counts are represented as an array of two-element arrays.
   *
   * @param {String} property "facet_fields", "facet_dates", or "facet_ranges".
   * @returns {Array} An array of objects with the properties <tt>facet</tt> and
   * <tt>count</tt>, e.g <tt>{ facet: 'facet', count: 1 }</tt>.
   */
  getFacetCountsArrarr: function (property) {
    var counts = [];
    for (var i = 0, l = this.manager.response.facet_counts[property][this.field].length; i < l; i++) {
      counts.push({
        facet: this.manager.response.facet_counts[property][this.field][i][0],
        count: parseInt(this.manager.response.facet_counts[property][this.field][i][1])
      });
    }
    return counts;
  },

  /**
   * Used if the facet counts are represented as a flat array.
   *
   * @param {String} property "facet_fields", "facet_dates", or "facet_ranges".
   * @returns {Array} An array of objects with the properties <tt>facet</tt> and
   * <tt>count</tt>, e.g <tt>{ facet: 'facet', count: 1 }</tt>.
   */
  getFacetCountsFlat: function (property) {
    var counts = [];
    for (var i = 0, l = this.manager.response.facet_counts[property][this.field].length; i < l; i += 2) {
      counts.push({
        facet: this.manager.response.facet_counts[property][this.field][i],
        count: parseInt(this.manager.response.facet_counts[property][this.field][i+1])
      });
    }
    return counts;
  },

  /**
   * @param {String} value The value.
   * @returns {Function} Sends a request to Solr if it successfully adds a
   *   filter query with the given value.
   */
  clickHandler: function (value) {
	 
    var self = this, meth = this.multivalue ? 'add' : 'set';
    return function () {
		 console.log("CLICK");
		 actualizaGraficoCircular(value);		 
	  if(!vm.lightmode()){
			 
		if (self[meth].call(self, value)) {
			self.doRequest();
		}
   	}else{
	// Modo local
		vm.filterData(self.field,value);
		console.log("Provincias: " + vm.listArray(self.field));

	}
	
      return false;
    }
  },
  
  checkBoxHandler: function (values){
	var self = this;
	
	return function () {
		active_orfilter.push({facet: self.fq(values)});
		return false;
	}

  },
  
  checkBoxSearch : function(){
	var self = this;
	
	var fquery = '';

	return function() {
	
	for (var i = 0, l = active_orfilter.length; i < l; i++) {
		var result = active_orfilter[i].facet;
		if(i==active_orfilter.length-1){
			fquery+=result;
		}else{
			fquery+=result + ' OR ';
		}
	}	

	Manager.store.addByValue('fq', fquery);

	Manager.doRequest();

	return false;
	}
	
  },
  /**
   * @param {String} value The value.
   * @returns {Function} Sends a request to Solr if it successfully removes a
   *   filter query with the given value.
   */
  unclickHandler: function (value) {
    var self = this;
    return function () {
      if (self.remove(value)) {
        self.doRequest();
      }
      return false;
    }
  },

  /**
   * @param {String} value The facet value.
   * @param {Boolean} exclude Whether to exclude this fq parameter value.
   * @returns {String} An fq parameter value.
   */
  fq: function (value, exclude) {
    return (exclude ? '-' : '') + this.field + ':' + AjaxSolr.Parameter.escapeValue(value);
  }
  
  
});

function actualizaGraficoCircular(filtro){
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

			
		d3.json("http://localhost/ftt/Visualizador3/script_conversorWheel.php?filter="+filtro, function(json) {
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
			url: 'http://localhost/ftt/Visualizador3/script_conversorBarras.php?filter='+filtro,
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
