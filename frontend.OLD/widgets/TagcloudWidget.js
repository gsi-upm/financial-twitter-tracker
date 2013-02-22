

(function ($) {

AjaxSolr.TagcloudWidget = AjaxSolr.AbstractFacetWidget.extend({
	beforeRequest: function (){
		vm.tagclouditems.removeAll();
	},

  afterRequest: function () {
    if (this.manager.response.facet_counts.facet_fields[this.field] === undefined) {
      $(this.target).html(AjaxSolr.theme('no_items_found'));
      return;
    }

    var maxCount = 0;
    var objectedItems = [];
	
    for (var facet in this.manager.response.facet_counts.facet_fields[this.field]) {
	//console.log("TAGCLOUD WIDGET: " + this.manager.response.facet_counts.facet_fields);
      var count = parseInt(this.manager.response.facet_counts.facet_fields[this.field][facet]);
      if (count > maxCount) {
        maxCount = count;
      }
      objectedItems.push({ facet: facet, count: count });
	  
    }
	
	
	
    objectedItems.sort(function (a, b) {
      return a.facet < b.facet ? -1 : 1;
    });

	self.active_orfilter = [];

    $(this.target).empty();
    
//vm.tagclouditems.push(['type', this.field]);
	//var allfacet = '[';
	//vm.tagclouditems.removeAll();

	var temp = ko.observableArray([['Header', 0]]);

    for (var i = 0, l = objectedItems.length; i < l; i++) {
	//vm.tagclouditems.push([objectedItems[i].facet,objectedItems[i].count]);
	temp.push([objectedItems[i].facet,objectedItems[i].count]);      

	  var facet = objectedItems[i].facet;

      $(this.target).append(AjaxSolr.theme('checkbox', this.checkBoxHandler(facet))).append(AjaxSolr.theme('tag', {value:facet,count:objectedItems[i].count}, parseInt(objectedItems[i].count / maxCount * 10), this.clickHandler(facet)));
    }

	//allfacet = allfacet + ']';
/*
	ko.utils.arrayFilter(temp(), function(itm) {
		console.log("Temp es: " + itm);
	});
*/
	//vm.tagclouditems.push({ type: this.field, values: [['Provincias',0],['Sevilla',10],['Oviedo',5]]});
	vm.tagclouditems.push({ type: this.field, values: temp });
	console.log("Push hecho!");
	//vm.logs();
	
	//$(this.target).append("<div id='dynamic' data-bind='foreach: vm.tagclouditems'><p data-bind='text: values'></p></div>");
	
	$(this.target).append(AjaxSolr.theme('tagsearch', this.checkBoxSearch()));
  }
});

})(jQuery);
