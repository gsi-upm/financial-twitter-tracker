(function ($) {

AjaxSolr.AutocompleteWidget = AjaxSolr.AbstractTextWidget.extend({

  afterRequest: function () {

    $(this.target).find('input').unbind().removeData('events').val('');
    var self = this;

    var callback = function (response) {
      var list = [];
		
	  
	  if(!isBlank(vm.autocomplete_fieldname())){
        var field = vm.autocomplete_fieldname().toString();
        for (var facet in response.facet_counts.facet_fields[field]) {
          list.push({
            field: field,
            value: facet,
            text: facet + ' (' + response.facet_counts.facet_fields[field][facet] + ') - ' + field
          });
        }
	  }
	  
      self.requestSent = false;
      $(self.target).find('input').unautocomplete().autocomplete(list, {
        formatItem: function(facet) {
          return facet.text;
        }
      }).result(function(e, facet) {
        self.requestSent = true;
        if (self.manager.store.addByValue('fq', facet.field + ':' + AjaxSolr.Parameter.escapeValue(facet.value))) {
          self.doRequest();
        }
      });
	
	
      // This has lower priority so that requestSent is set.
      $(self.target).find('input').bind('keydown', function(e) {
        if (self.requestSent === false && e.which == 13) {
          var value = $(this).val();
      	  if (value=="") value = "*:*";
      		console.log("La query es: " + value);
     
          if (value && self.set(value)) {
		// Si está habilitado el modo de consulta SPARQL
		if(vm.sparql()){
	   		getResultsSPARQL(value);
		}else{
	   		// Modo normal (búsqueda semántica)
	   		/*
			$("#results_sparql").empty();
      	   		$('#pager-header').show();
	   		$('.seleccion_actual').show();
			*/
	   		self.doRequest();
		}
 	  }
        }
      });
    } // end callback

    var params = [ 'rows=0&facet=true&facet.limit=-1&facet.mincount=1&json.nl=map' ];
	var field = vm.autocomplete_fieldname();
	
	if(isBlank(field)){
		console.log("ES VACIO");
	}else{
		console.log("NO ES VACIO");
		params.push('facet.field=' + field.toString());	
	}

    var values = this.manager.store.values('fq');
    for (var i = 0; i < values.length; i++) {
      params.push('fq=' + encodeURIComponent(values[i]));
    }
    params.push('q=' + this.manager.store.get('q').val());
    jQuery.getJSON(this.manager.solrUrl + 'select?' + params.join('&') + '&wt=json&json.wrf=?', {}, callback);

  }
});

})(jQuery);
