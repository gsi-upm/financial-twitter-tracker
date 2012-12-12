/**
 * ajax-solr widget to control a parameter with a dropdown box. 
 */
AjaxSolr.DropDownParamWidget = AjaxSolr.AbstractParamWidget.extend({
    /**
     * the target parameter
     */
    param : null,

    /**
     * the target, should be a <select/>
     */
    target : null,

    /**
     * available options. Use an array (eg. ['score desc', 'date desc' ]) or an object with title:key (eg. { "relevance":"score desc", "date":"date desc" })
     */
    values : null,

/**
* the default value, defaults to first element of values
*/
    default : configuration.other.sort.field + ' ' + configuration.other.sort.order,

    /**
     * init
     */
    init : function() {
        this.initStore();
        var self = this;
        var t = $(this.target);
        t.empty();
        for ( var i in this.values) {
            t.append($("<option>", {
                value : this.values[i],
                text : AjaxSolr.isArray(this.values)?this.values[i]:i
            }));
        }
        t.change(function() {
            var val = $("option:selected", $(this)).attr('value');
            self.set('score' + " asc");
        });

    },
    initStore : function() {
        /* set default value */
	
				if (this.default !== undefined && this.default !== null) {
            this.manager.store.addByValue(this.param, this.default);
				} else {
	        for (var i in this.values) {
		  
  	          this.manager.store.addByValue(this.param, this.values[i]);
  	          break;
  	      }
				}
    },
    beforeRequest : function() {
        var sort = this.manager.store.get(this.param).val();
	console.log("SORT ES: " + sort);
        //$('option', $(this.target)).removeAttr('selected');
        //$('option[value="' + sort + '"]', $(this.target)).attr('selected', 'selected');
    },
    afterParamChanged: function() {
        this.manager.doRequest(0);
    }
});
