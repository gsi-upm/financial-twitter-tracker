
function Result(source, predicate, object) {
    this.source = ko.observable(source);
    this.predicate = ko.observable(predicate);
    this.object = ko.observable(object);
}

function Result2(data){
	this.source = ko.observable(data.s);
	this.predicate = ko.observable(data.p);
	this.object = ko.observable(data.o);
	
}

function ResultsListViewModel() {
    // Data
    var self = this;
    //self.results = ko.observableArray([new Result("s", "p","o"),new Result("s", "p","o2")]);
	self.results = ko.observableArray([]);
	
    // Load initial state from server, convert it to Task instances, then populate self.tasks
    $.getJSON("http://shannon.gsi.dit.upm.es/episteme/lmf/sparql/select?query=SELECT+*+WHERE+%7B%3Fs+%3Fp+%3Fo%7D&output=json", function(allData) {
        var mappedTasks = $.map(allData, function(item) { return new Result2(item) });
        self.results(mappedTasks);
    });    
}
ko.applyBindings(new ResultsListViewModel());