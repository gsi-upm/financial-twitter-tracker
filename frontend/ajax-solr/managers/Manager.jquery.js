// $Id$

/**
 * @see http://wiki.apache.org/solr/SolJSON#JSON_specific_parameters
 * @class Manager
 * @augments AjaxSolr.AbstractManager
 */
AjaxSolr.Manager = AjaxSolr.AbstractManager.extend(
  /** @lends AjaxSolr.Manager.prototype */
  {
  executeRequest: function (servlet, string, handler) {

    var self = this;
    string = string || this.store.string();
    handler = handler || function (data) {
      self.handleResponse(data);
    };
    if (this.proxyUrl) {
      jQuery.post(this.proxyUrl, { query: string }, handler, 'json');
    }
    else {

	if(vm.lightmode()){
	      jQuery.getJSON(vm.solr_baseURL() + servlet + '?' + string + '&rows=300&wt=json&json.wrf=?', {}, handler);
	}else{
	      jQuery.getJSON(vm.solr_baseURL() + servlet + '?' + string + '&rows=10&&wt=json&json.wrf=?', {}, handler);
	}
    }
  }
});
