(function ($) {

AjaxSolr.theme.prototype.result = function (doc, snippet) {
   //console.log("Propiedad doc: " + doc);
    for (var i = 0, l = doc.length; i < l; i++) {
		console.log("Propiedad i: " + doc[i]);
	}

  var output = '<div class="resultado">';
  if(doc[configuration.results.image]) {
	output += '<img id="image" src="'+doc[configuration.results.image]+'"/>';
  }

  output += '<h2>' + doc[configuration.results.title] + '</h2>';
  //doc.name or doc['name']

  output += '<h4>' + doc[configuration.results.subtitle] + '</h4>';


  output += '<p id="links_' + doc[configuration.results.link] + '" class="links"></p>';
  output += '<p>' + doc[configuration.results.description] + '</p></div>';
  return output;
};

AjaxSolr.theme.prototype.snippet = function (doc) {
  var output = '';
  if (doc[configuration.results.description].length > 50) {
    output += doc[configuration.results.description].substring(0, 300);
    output += '<span style="display:none;">' + doc[configuration.results.description].substring(300);
    output += '</span> <a href="#" class="more">more</a>';
  }
  else {
    output += doc[configuration.results.description];
  }
  return output;
};

AjaxSolr.theme.prototype.tag = function (facet, weight, handler) {
  return $('<a href="#" class="tagcloud_item"></a></br>').text(facet.value).append(' (' + facet.count + ')').click(handler);
};

AjaxSolr.theme.prototype.checkbox = function (handler) {
  return $('<a href="#" class="tagcloud_item"></a>').text("Filtrar ").click(handler);
};

AjaxSolr.theme.prototype.tagsearch = function (handler) {
  return "<br>";
};

AjaxSolr.theme.prototype.facet_link = function (field, value, handler) {
  return [ field + ':', $('<a href="#"/>').text(value).click(handler) ];
};

AjaxSolr.theme.prototype.no_items_found = function () {
  return 'No se encontraron coincidencias';
};

})(jQuery);
