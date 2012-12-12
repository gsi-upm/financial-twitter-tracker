(function ($) {

AjaxSolr.TextWidget = AjaxSolr.AbstractTextWidget.extend({

init: function () {
  var self = this;
  $(this.target).find('input').bind('keydown', function(e) {
    if (e.which == 13) {
      var value = $(this).val();
      if (value=="") value = "*:*";
      console.log("La query es: " + value);
     
      if (value && self.set(value)) {
	// Si está habilitado el modo de consulta SPARQL
	if(vm.sparql()){
	   getResultsSPARQL();
	
	}else{
	   // Modo normal (búsqueda semántica)
	   $("#results_sparql").empty();
      	   $('#pager-header').show();
	   $('.seleccion_actual').show();
	   self.doRequest();
	}
      }
    }
  });
},

afterRequest: function () {
  $(this.target).find('input').val('');
}
})


})(jQuery);
