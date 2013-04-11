function InitModel() {

	var self = this;
	
	self.lang = ko.observable(languages[0]);
	self.selectedLanguage = ko.observable(configuration.template.language);

	/** Language related functions */
	self.languages = ko.computed(function () {
		var response = new Array();
		for(var i=0, l = languages.length; i<l; i++){
			response.push(languages[i].lang);	
		}	
		return response;
	});
	
	self.selectedLanguageIndex = ko.dependentObservable(function() {
		return self.languages().indexOf(self.selectedLanguage());
	}, self);
	
	/** Subscribe to changes on language's select */
	self.selectedLanguage.subscribe(function (newValue) {
		var idx = self.selectedLanguageIndex();
		
		if(idx>-1){
			self.lang(languages[parseInt(idx)]);
			}else{
		}
		
	});

}

var m = new InitModel();
