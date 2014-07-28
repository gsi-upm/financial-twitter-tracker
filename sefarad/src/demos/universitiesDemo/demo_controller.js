                
                this.get('#/sparql/universitiesDemo', function () {
                    console.log("UNIVERSITIES DEMO");
                    self.sparql = ko.observable(true);
                    vm.getResultsSPARQL("select distinct ?university ?city ?country ?latitude ?longitude where { { ?universityresource <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/University> ; <http://dbpedia.org/ontology/country> ?countryresource ; <http://dbpedia.org/ontology/country> <http://dbpedia.org/resource/Spain> ; <http://dbpedia.org/ontology/city> ?cityresource ; <http://www.w3.org/2000/01/rdf-schema#label> ?university ; <http://www.w3.org/2003/01/geo/wgs84_pos#lat> ?latitude ; <http://www.w3.org/2003/01/geo/wgs84_pos#long> ?longitude . ?countryresource <http://www.w3.org/2000/01/rdf-schema#label> ?country . ?cityresource <http://www.w3.org/2000/01/rdf-schema#label> ?city } UNION { ?universityresource <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/University> ; <http://dbpedia.org/ontology/country> ?countryresource ; <http://dbpedia.org/ontology/country> <http://dbpedia.org/resource/France> ; <http://dbpedia.org/ontology/city> ?cityresource ; <http://www.w3.org/2000/01/rdf-schema#label> ?university ; <http://www.w3.org/2003/01/geo/wgs84_pos#lat> ?latitude ; <http://www.w3.org/2003/01/geo/wgs84_pos#long> ?longitude . ?countryresource <http://www.w3.org/2000/01/rdf-schema#label> ?country . ?cityresource <http://www.w3.org/2000/01/rdf-schema#label> ?city } FILTER ( lang(?university) = 'en' && lang(?country) = 'en' && lang(?city) = 'en') }", "http://dbpedia.org/sparql");
                    configuration.template.language = "English";
                    configuration.template.pageTitle = "Universities Demo";
                    configuration.results.resultsLayout = [{
                        Name: "Títulos",
                        Value: "university"
                    }, {
                        Name: "Subtítulo",
                        Value: "country"
                    }, {
                        Name: "Descripción",
                        Value: "city"
                    }, {
                        Name: "Logo",
                        Value: ""
                    }, ];
                    templateWidgetsLeft.push({
                        id: 0,
                        title: 'Countries',
                        type: 'tagcloud',
                        field: 'country',
                        collapsed: false,
                        query: '',
                        value: [],
                        values: [],
                        limits: '',
                        layout: 'horizontal',
                        showWidgetConfiguration: false
                    });
                    // templateWidgetsLeft.push({
                    //     id: 1,
                    //     title: 'Cities',
                    //     type: 'tagcloud',
                    //     field: 'city',
                    //     collapsed: false,
                    //     query: '',
                    //     value: [],
                    //     values: [],
                    //     limits: '',
                    //     layout: 'horizontal',
                    //     showWidgetConfiguration: false
                    // });
                    configuration.autocomplete.field = "university";
                    self.securityEnabled(false);
                    self.adminMode(true);
                    sparqlmode = true;
                    init();

                    //Adding widgets
                    $(window).load(function () {
                        //Add map widget
                        widgetMap.render();

                        // // Add results widget
                        self.activeWidgetsRight.push({
                            "id": ko.observable(0),
                            "title": ko.observable(self.lang().results),
                            "type": ko.observable("resultswidget"),
                            "collapsed": ko.observable(false),
                            "layout": ko.observable("vertical"),
                            "showWidgetConfiguration": ko.observable(false)
                        });

                        // Add resultstats widget
                        self.addResultStatsWidget();

                        // Add PieChart sgvizler wigdet
                        self.sgvizlerQuery("SELECT ?university ?students WHERE{ ?universityresource <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/University> ; <http://dbpedia.org/ontology/country> ?countryresource ; <http://www.w3.org/2000/01/rdf-schema#label> ?university . ?countryresource <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/class/yago/EuropeanCountries> . ?universityresource <http://dbpedia.org/ontology/numberOfStudents> ?students FILTER ( lang(?university) = 'en') } GROUP BY ?university LIMIT 50");
                        self.sgvizlerGraphType('google.visualization.PieChart');
                        self.sparql_baseURL("http://dbpedia.org/sparql");
                        self.addSgvizlerWidget("Total students by University");

                        // Add Gauge Widget
                        var id = Math.floor(Math.random() * 10001);
                        self.activeWidgetsLeft.push({
                            "id": ko.observable(id),
                            "title": ko.observable("Total Universities"),
                            "type": ko.observable("radialgauge"),
                            "collapsed": ko.observable(false)
                        });
                        self.numberOfResults.valueHasMutated();
                    });
                });