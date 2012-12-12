/*  Sgvizler JavaScript SPARQL result set visualizer, version 0.4.0
 *  (c) 2011 Martin G. Skjæveland
 *
 *  Sgvizler is freely distributable under the terms of an MIT-style license.
 *  Sgvizler web site: https://code.google.com/p/sgvizler/
 *
 *  Relies on Google Visualiztion API and jQuery:
 *    src="https://www.google.com/jsapi"
 *    src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js"
 *--------------------------------------------------------------------------*/

var sgvizler = {

    home: (window.location.href).replace(window.location.search, ""),

    queryOptions: {},
    queryOptionDefaults: {
        'query':                  "SELECT * WHERE {?s ?p ?o}",
        'endpoint':               "http://shannon.gsi.dit.upm.es/episteme/lmf/sparql/select?",
        'endpoint_output':        'json',  // xml, json
        'chart':                  'gLineChart',
        'loglevel':               2
    },

    //// Prefixes included in queries:
    namespaces: {
        'rdf' : "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        'rdfs': "http://www.w3.org/2000/01/rdf-schema#",
        'owl' : "http://www.w3.org/2002/07/owl#",
        'xsd' : "http://www.w3.org/2001/XMLSchema#"
    },

    chartOptions: {},
    chartOptionDefaults: {
        'width':           '800',
        'height':          '400',
        'chartArea':       { left: '5%', top: '5%', width: '75%', height: '80%' },
             'gGeoMap': {
                 'dataMode':           'markers'
             },
             'gMap': {
                 'dataMode':           'markers'
             },
             'sMap': {
                 'dataMode':           'markers',
                 'showTip':            true,
                 'useMapTypeControl':  true
             },
             'gSparkline':{
                 'showAxisLines':      false
             }
    },

    //// #id's to html elements:
    html: {
        script:       'sgvzlr_script',    // #id to the script tag for this file
        chartCon:     'sgvzlr_gchart',    // #id to the container to hold the chart
        queryForm:    'sgvzlr_formQuery', //
        queryTxt:     'sgvzlr_cQuery',    // query text area.
        formQuery:    'sgvzlr_strQuery',  // hidden query string. "trick" taken from snorql.
        formWidth:    'sgvzlr_strWidth',  //
        formHeight:   'sgvzlr_strHeight', //
        formChart:    'sgvzlr_optChart',  //
        prefixCon:    'sgvzlr_cPrefix',   // print prefixes
        messageCon:   'sgvzlr_cMessage',  // print messages

        queryOptionPrefix: 'data-sgvizler-',
        chartOption: 'data-sgvizler-chart-options'
    },

    chartTypes: [],
    initGoogleObjects: function() { // need to wait for google apis to load
        sgvizler.GChartTypes = [
        { 'id': "gLineChart",        'name': "Line Chart",        'func': google.visualization.LineChart },
        { 'id': "gAreaChart",        'name': "Area Chart",        'func': google.visualization.AreaChart },
        { 'id': "gPieChart",         'name': "Pie Chart",         'func': google.visualization.PieChart },
        { 'id': "gColumnChart",      'name': "Column Chart",      'func': google.visualization.ColumnChart },
        { 'id': "gBarChart",         'name': "Bar Chart",         'func': google.visualization.BarChart },
        { 'id': "gSparkline",        'name': "Sparkline",         'func': google.visualization.ImageSparkLine },
        { 'id': "gScatterChart",     'name': "Scatter Chart",     'func': google.visualization.ScatterChart },
        { 'id': "gCandlestickChart", 'name': "Candlestick Chart", 'func': google.visualization.CandlestickChart },
        { 'id': "gGauge",            'name': "Gauge",             'func': google.visualization.Gauge },
        { 'id': "gOrgChart",         'name': "Org Chart",         'func': google.visualization.OrgChart },
        { 'id': "gTreeMap",          'name': "Tree Map",          'func': google.visualization.TreeMap },
        { 'id': "gTimeline",         'name': "Timeline",          'func': google.visualization.AnnotatedTimeLine },
        { 'id': "gMotionChart",      'name': "Motion Chart",      'func': google.visualization.MotionChart },
        { 'id': "gGeoChart",         'name': "Geo Chart",         'func': google.visualization.GeoChart },
        { 'id': "gGeoMap",           'name': "Geo Map",           'func': google.visualization.GeoMap },
        { 'id': "gMap",              'name': "Map",               'func': google.visualization.Map },
        { 'id': "gTable",            'name': "Table",             'func': google.visualization.Table }
        ];
    },

    // kept in external files:
    visualization: {},
    example: {},

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    go: function() {
	console.log("En go()");
        // load "child" scripts and stylesheets
        //sgvizler.homefolder = ($('#' + sgvizler.html.script).length) ? $('#' + sgvizler.html.script).attr('src').replace(/sgvizler\.js$/, "") : "";
        $.ajax('js/sgvizler.visualization.js', { dataType: "script", async: false });
        $('head').append('<link rel="stylesheet" href="js/sgvizler.visualization.css" type="text/css" />');

        // load user settings
        $.extend(sgvizler.queryOptionDefaults, sgvizler.queryOptions);
        $.extend(sgvizler.chartOptionDefaults, sgvizler.chartOptions);

        google.load('visualization', '1.0', {'packages': ['annotatedtimeline', 'corechart', 'gauge', 'geomap', 'imagesparkline', 'map', 'orgchart', 'table', 'motionchart', 'treemap']});
        google.setOnLoadCallback(function() {
            sgvizler.initGoogleObjects();
            $.merge(sgvizler.chartTypes, sgvizler.GChartTypes); // collect all charttypes
            for(var chart in sgvizler.visualization){
                sgvizler.util.registerFunction(
                    {'id': sgvizler.visualization[chart].prototype.id,
                     'name': sgvizler.visualization[chart].prototype.name,
                     'func': sgvizler.visualization[chart] });}
            sgvizler.draw();
        });
    },

    draw: function() {
        var p = sgvizler.util.getUrlParams(),
            q = $.extend({}, sgvizler.queryOptionDefaults, p);

        if($('#'+sgvizler.html.prefixCon).length){
            sgvizler.ui.displayPrefixes();}
        if($('#'+sgvizler.html.formChart).length){
            sgvizler.ui.displayChartTypesMenu();}
        if($('#'+sgvizler.html.formQuery).length){
            sgvizler.ui.displayUserInput(q);}
        if($('#'+sgvizler.html.chartCon).length && p.query){ // query supplied in URL
            q.container = sgvizler.html.chartCon;
            sgvizler.drawChart(q, sgvizler.util.flattenChartOptions(q.chart));
        }

        sgvizler.drawContainerQueries();
    },

    drawContainerQueries: function() {
        $('[' + sgvizler.html.queryOptionPrefix + 'query]').each(function() {
            var id = $(this).attr('id'),
                q = {'container': id},
                c = {};

            for(var i = 0; i < this.attributes.length; i++){
                var name = this.attributes[i].name,
                    value = this.attributes[i].value;
                if(name === sgvizler.html.chartOption){
                    c = sgvizler.util.getContainerChartOptions(value);}
                else if(name.lastIndexOf(sgvizler.html.queryOptionPrefix, 0) === 0){ // starts-with queryOptionPrefix
                    q[name.substring(sgvizler.html.queryOptionPrefix.length)] = value;}
            }
            if(typeof q.rdf !== 'undefined'){
                q.query = sgvizler.util.buildQueryWFrom(q.query, q.rdf);}
            
            c.width = $(this).css('width');
            c.height = $(this).css('height');

            q = $.extend(true, {}, sgvizler.queryOptionDefaults, q);
            c = $.extend(sgvizler.util.flattenChartOptions(q.chart), c);
            sgvizler.drawChart(q, c);
        });
    },

    drawChart: function(queryOpt, chartOpt) {
        var chart = sgvizler.util.getChartType(queryOpt.container, queryOpt.chart);
        sgvizler.runQuery(queryOpt, function(data) {
            var datatable = new google.visualization.DataTable(data);
            chart.draw(datatable, chartOpt); });
    },

    runQuery: function(queryOpt, callback) {
        sgvizler.ui.displayMessage(queryOpt.container, 1, queryOpt);
        queryOpt.encodedQuery = encodeURIComponent(sgvizler.util.getPrefixes() + queryOpt.query);
        if ($.browser.msie && window.XDomainRequest){
            var xdr = new XDomainRequest(),
                url = queryOpt.endpoint + "?query=" + queryOpt.encodedQuery + "&output=" + queryOpt.endpoint_output;
            xdr.open("GET", url);
            xdr.onload = function() {
                var data;
                if(queryOpt.endpoint_output === "json"){
                    data = $.parseJSON(xdr.responseText);}
                else {
                    data = $.parseXML(xdr.responseText);}
                sgvizler.processQueryResults(data, queryOpt, callback);
            };
            xdr.send();
        } else {
            $.get(queryOpt.endpoint,
                  {query: sgvizler.util.getPrefixes() + queryOpt.query },
                  function(data) {sgvizler.processQueryResults(data, queryOpt, callback);},
                  queryOpt.endpoint_output)
                .error(function() {
                    sgvizler.ui.displayMessage(queryOpt.container, 2, queryOpt);
                });
        }
    },

    processQueryResults: function(data, queryOpt, callback) {
        var noRows = null;
        if(queryOpt.endpoint_output === 'json'){
            noRows = sgvizler.parser.countRowsSparqlJSON(data);}
        else { // xml
            noRows = sgvizler.parser.countRowsSparqlXML(data);}
        queryOpt.noRows = noRows;

        if(noRows === null){
            sgvizler.ui.displayMessage(queryOpt.container, 3, queryOpt);}
        else if(noRows === 0){
            sgvizler.ui.displayMessage(queryOpt.container, 4, queryOpt);}
        else {
            sgvizler.ui.displayMessage(queryOpt.container, 5, queryOpt);
            if(queryOpt.endpoint_output === "json"){
                data = sgvizler.parser.SparqlJSON2GoogleJSON(data);}
            else { // xml
                data = sgvizler.parser.SparqlXML2GoogleJSON(data);}

            callback(data);
        }
    },


    util: {

        buildQueryWFrom: function(query, fromstr) {
            var frompaths = fromstr.split('|'),
                from = "";
            for(var i in frompaths){
                from += 'FROM <' + frompaths[i] + '>\n'; }
            return query.replace(/(WHERE)?(\s)*\{/, '\n' + from + 'WHERE \{');
        },

        getContainerChartOptions: function(optstr) {
            var chartOpt = {},
                options = optstr.split('|');
            for(var i in options){
                var option = options[i].split('=');
                chartOpt[option[0]] = option[1];
            }
            return chartOpt;
        },

        flattenChartOptions: function(chart) {
            var all = sgvizler.chartOptionDefaults,
                chartOpt = {};
            for(var level1 in all){
                if(level1 === chart){
                    for(var level2 in all[level1]){
                        chartOpt[level2] = all[level1][level2];}}
                else{
                    chartOpt[level1] = all[level1];}
            }
            return chartOpt;
        },

        getChartType: function(containerId, charttype) {
            var container = document.getElementById(containerId),
                c = sgvizler.chartTypes;
            for(var i = 0; i < c.length; i++){
                if(charttype === c[i].id){
                    return new c[i].func(container);}
            }
        },

        registerFunction: function(visualizationFunction) {
            sgvizler.chartTypes.push(visualizationFunction);
        },

        getUrlParams: function() {
            var urlParams = {},
                URLparams = [ 'query', 'chart', 'width', 'height' ], // permissible params
                e,
                a = /\+/g,  // regex replacing '+' with a space
                r = /([^&=]+)=?([^&]*)/g,
                d = function(s) { return decodeURIComponent(s.replace(a, " ")); },
                q = window.location.search.substring(1);

            while (e = r.exec(q)){
                if(e[2].length > 0 && $.inArray(e[1],URLparams !== -1)){
                    urlParams[d(e[1])] = d(e[2]);}}
            return urlParams;
        },

        getPrefixes: function() {
            var prefixes = "";
            for(var prefix in sgvizler.namespaces){
                prefixes += "PREFIX " + prefix + ": <" + sgvizler.namespaces[prefix] + ">\n";
            }
            return prefixes;
        },

        prefixify: function(url){
            for(var ns in sgvizler.namespaces){
                if(url.lastIndexOf(sgvizler.namespaces[ns], 0) === 0){
                    return url.replace(sgvizler.namespaces[ns], ns + ":");
                }
            }
            return url;
        },

        unprefixify: function(qname){
            for(var ns in sgvizler.namespaces){
                if(qname.lastIndexOf(ns+":", 0) === 0){
                    return qname.replace(ns+":", sgvizler.namespaces[ns]);
                }
            }
            return qname;
        }
    },


    ui: {
        displayUserInput: function(userdata) {
            $('#'+sgvizler.html.queryTxt).val(userdata.query);
            $('#'+sgvizler.html.formChart).val(userdata.chart);
            $('#'+sgvizler.html.formWidth).val(userdata.width);
            $('#'+sgvizler.html.formHeight).val(userdata.height);
        },

        displayChartTypesMenu: function() {
            var c = sgvizler.chartTypes;
            for(var i = 0; i < c.length; i++){
                $('#' + sgvizler.html.formChart)
                    .append($('<option/>')
                            .val(c[i].id)
                            .html(c[i].name));
            }
        },

        displayMessage: function(container, messageNo, queryOpt) {
            var message = "";
            if(queryOpt.loglevel === 0){
                return;}
            else if(queryOpt.loglevel === 1){
                if(messageNo === 1){
                    message = "Loading...";}
                else if(messageNo === 2 || messageNo === 3){
                    message = "Error.";} }
            else{
                if(messageNo === 1){
                    message = "<p>Sending query...</p>"; }
                else if(messageNo === 2){
                    message = "<p>Error querying endpoint. Possible errors:<ul>" +
                        "<li><a href='" + queryOpt.endpoint + "'>SPARQL endpoint</a> down?";
                    if(typeof queryOpt.endpoint_query_url !== 'undefined'){
                        message += " <a href='" +
                            queryOpt.endpoint + queryOpt.endpoint_query_url  + queryOpt.encodedQuery + "'>" +
                            "Check if query runs at the endpoint</a>";}
                    message += ".</li><li>Malformed SPARQL query?";
                    if(typeof queryOpt.validator_query_url !== 'undefined'){
                        message += " <a href='" + queryOpt.validator_query_url + queryOpt.encodedQuery +
                            "'> Check if it validates</a>"; }
                    message += ".</li><li>CORS supported and enabled? If this page <code>" + sgvizler.home + 
                        "</code> and the SPARQL endpoint <code>" + queryOpt.endpoint +
                        "</code> are <i>not</i> located at the same domain and port, does your " +
                        "browser support CORS and is the endpoint CORS enabled? Read more about " +
                        "<a href=\"http://code.google.com/p/sgvizler/wiki/Compatibility\">CORS and compatibility</a>.</li>"; 
                    message += "<li>Is your <a href=\"http://code.google.com/p/sgvizler/wiki/Compatibility\">browser support</a>ed?.</li>";
                    message += "<li>Hmm.. it might be a bug! Please file a report to " +
                        "<a href=\"http://code.google.com/p/sgvizler/issues/\">the issues</a>.</li></ul></p>";}
                else if(messageNo === 3){
                    message = "<p>Unknown error.</p>";}
                else if(messageNo === 4){
                    message = "<p>Query returned no results.</p>";}
                else if(messageNo === 5){
                    message = "<p>Received " + queryOpt.noRows + " rows. Drawing chart...";
                    if(typeof queryOpt.endpoint_query_url !== 'undefined'){
                        message += "<br/><a target='_blank' href='" +
                            queryOpt.endpoint + queryOpt.endpoint_query_url + queryOpt.encodedQuery + "'>" +
                            "View query results</a> (in new window).";}
                    message += "</p>";
                }
            }

            if(container === sgvizler.html.chartCon && sgvizler.html.messageCon.length){
                $('#'+sgvizler.html.messageCon).html(message);}
            else{
                $('#'+container).html(message);}
        },

        displayPrefixes: function() {
            $('#'+sgvizler.html.prefixCon).text(sgvizler.util.getPrefixes());
        },

        resetPage: function() {
            document.location = sgvizler.home;
        },

        submitQuery: function() {
            $('#'+sgvizler.html.formQuery).val($('#'+sgvizler.html.queryTxt).val());
            $('#'+sgvizler.html.queryForm).submit();
        }
    },


    parser: {
    // variable notation: xtable, xcol(s), xrow(s) -- x is 's'(parql) or 'g'(oogle).

        defaultGDatatype: 'string',

        countRowsSparqlXML: function(sxml) {
            return $(sxml).find('sparql').find('results').find('result').length;
        },

        countRowsSparqlJSON: function(stable) {
            if(typeof stable.results.bindings !== 'undefined'){
                return stable.results.bindings.length;}
        },

        SparqlXML2GoogleJSON: function(sxml) {
            var gcols = [],
                grows = [],
                gdatatype = [], // for easy reference of datatypes
                sresults = $(sxml).find('sparql').find('results').find('result');

            // gcols
            var c = 0;
            $(sxml).find('sparql').find('head').find('variable').each(function() {
                var stype = null,
                    sdatatype = null,
                    name = $(this).attr('name'),
                    scells = $(sresults).find('binding[name="' + name + '"]');
                if(scells.length){
                    var scell = $(scells).first().children().first()[0], // uri, literal element
                        stype = scell.nodeName;
                        sdatatype = $(scell).attr('datatype');
                }
                gdatatype[c] = sgvizler.parser.getGoogleJsonDatatype(stype, sdatatype);
                gcols[c] = {'id': name, 'label': name, 'type': gdatatype[c]};
                c++;
            });

            // grows
            var r = 0;
            $(sresults).each(function() {
                var grow = [];
                for(var c = 0; c < gcols.length; c++){
                    var gvalue = null,
                        scells = $(this).find('binding[name="' + gcols[c].id + '"]');
                    if(scells.length &&
                       $(scells).first().children().first() !== 'undefined' &&
                       $(scells).first().children().first().firstChild !== null){
                        var scell = $(scells).first().children().first()[0], // uri, literal element
                            stype = scell.nodeName,
                            svalue = $(scell).first().text();
                        gvalue = sgvizler.parser.getGoogleJsonValue(svalue, gdatatype[c], stype);
                    }
                    grow[c] = {'v': gvalue};
                }
                grows[r] = {'c': grow};
                r++;
            });
            return {'cols': gcols, 'rows': grows};
        },

        SparqlJSON2GoogleJSON: function(stable) {
            var gcols = [],
                grows = [],
                gdatatype = [], // for easy reference of datatypes
                scols = stable.head.vars,
                srows = stable.results.bindings;

            for(var c = 0; c < scols.length; c++){
                var r = 0,
                    stype = null,
                    sdatatype = null;
                // find a row where there is a value for this column
                while(typeof srows[r][scols[c]] === 'undefined' && r+1 < srows.length){r++;}
                if(typeof srows[r][scols[c]] !== 'undefined'){
                    stype = srows[r][scols[c]].type;
                    sdatatype = srows[r][scols[c]].datatype;
                }
                gdatatype[c] = sgvizler.parser.getGoogleJsonDatatype(stype, sdatatype);
                gcols[c] = {'id': scols[c], 'label': scols[c], 'type': gdatatype[c]};
            }

            // loop rows
            for(var r = 0; r < srows.length; r++){
                var srow = srows[r],
                    grow = [];
                // loop cells
                for(var c = 0; c < scols.length; c++){
                    var gvalue = null;
                    if(typeof srow[scols[c]] !== 'undefined' &&
                       typeof srow[scols[c]].value !== 'undefined'){
                        gvalue = sgvizler.parser.getGoogleJsonValue(srow[scols[c]].value, gdatatype[c], srow[scols[c]].type);}
                    grow[c] = {'v': gvalue};
                }
                grows[r] = {'c': grow};
            }
            return {'cols': gcols, 'rows': grows};
        },

        getGoogleJsonValue: function(value, gdatatype, stype) {
            if(gdatatype === 'number'){
                return Number(value); }
            else if(gdatatype === 'date'){
                //assume format yyyy-MM-dd
                return new Date(value.substr(0,4),
                                value.substr(5,2),
                                value.substr(8,2));}
            else if(gdatatype === 'datetime'){
                //assume format yyyy-MM-ddZHH:mm:ss
                return new Date(value.substr(0,4),
                                value.substr(5,2),
                                value.substr(8,2),
                                value.substr(11,2),
                                value.substr(14,2),
                                value.substr(17,2));}
            else if(gdatatype === 'timeofday'){
                //assume format HH:mm:ss
                return [value.substr(0,2),
                        value.substr(3,2),
                        value.substr(6,2)];}
            else { // datatype === 'string' || datatype === 'boolean'
                if(stype === 'uri'){ // replace namespace with prefix
                    return sgvizler.util.prefixify(value);}
                return value;
            }
        },

        getGoogleJsonDatatype: function(stype, sdatatype) {
            if(typeof stype !== 'undefined' && (stype === 'typed-literal' || stype === 'literal')){
                if(sdatatype === "http://www.w3.org/2001/XMLSchema#float"   ||
                   sdatatype === "http://www.w3.org/2001/XMLSchema#double"  ||
                   sdatatype === "http://www.w3.org/2001/XMLSchema#decimal" ||
                   sdatatype === "http://www.w3.org/2001/XMLSchema#int"     ||
                   sdatatype === "http://www.w3.org/2001/XMLSchema#long"    ||
                   sdatatype === "http://www.w3.org/2001/XMLSchema#integer"){
                    return 'number';
                } else if(sdatatype === "http://www.w3.org/2001/XMLSchema#boolean"){
                    return 'boolean';
                } else if(sdatatype === "http://www.w3.org/2001/XMLSchema#date"){
                    return 'date';
                } else if(sdatatype === "http://www.w3.org/2001/XMLSchema#dateTime"){
                    return 'datetime';
                } else if(sdatatype === "http://www.w3.org/2001/XMLSchema#time"){
                    return 'timeofday';
                }
            }
            return sgvizler.parser.defaultGDatatype;
        }
    }
};


jQuery.ajaxSetup({
    accepts: {
        xml:  "application/sparql-results+xml",
        json: "application/sparql-results+json"
    }
});
