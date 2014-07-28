(function ($) {

AjaxSolr.AutocompleteWidget = AjaxSolr.AbstractTextWidget.extend({

  afterRequest: function () {

    $(this.target).find('input').val('');
    var self = this;
	
	
    var callback = function (response) {
		vm.autoCompleteFieldsSOLR.removeAll();

		var field = vm.default_autocomplete_fieldname().toString();
		if(vm.activedAutocomplete()){
			if(!isBlank(vm.autocomplete_fieldname())){
				field = vm.autocomplete_fieldname().toString();
			
			}
	  
			for (var facet in response.facet_counts.facet_fields[field]) {
			
				vm.autoCompleteFieldsSOLR.push(facet.toString());
			}	  
		}
		
      // This has lower priority so that requestSent is set.
      $(self.target).find('input').bind('keydown', function(e) {
        if (e.which == 13) {
          var value = $(this).val();
      	  if (value=="") value = "*:*";
      		//console.log("La query es: " + value);
     
			if (value && self.set(value)) {
				// Si está habilitado el modo de consulta SPARQL
				if(!vm.sparql()){
					// Modo normal (búsqueda semántica)
					if(value=="*:*"){
						vm.filter("");
					}else{
						vm.filter(value);
					}
					self.doRequest();
				}
			}
        }
      });
    } // end callback

    var params = [ 'rows=0&facet=true&facet.limit=-1&facet.mincount=1&json.nl=map' ];
	
	if(!isBlank(vm.autocomplete_fieldname())){
		field = vm.autocomplete_fieldname().toString();		
	}else{
		var field = vm.default_autocomplete_fieldname().toString();
	}
		
	if(!isBlank(field)){
		params.push('facet.field=' + field.toString());	

		var values = this.manager.store.values('fq');
		for (var i = 0; i < values.length; i++) {
			params.push('fq=' + encodeURIComponent(values[i]));
		}

		params.push('q=' + this.manager.store.get('q').val());
    
		jQuery.getJSON(vm.solr_baseURL() + 'select?' + params.join('&') + '&wt=json&json.wrf=?', {}, callback);		
	}


  }
});

})(jQuery);
