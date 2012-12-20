/*  Sgvizler visualization functions
 *  (c) 2011 Martin G. Skjæveland
 *
 *  Sgvizler is freely distributable under the terms of an MIT-style license.
 *  Sgvizler web site: https://code.google.com/p/sgvizler/
 *--------------------------------------------------------------------------*/

var ___;

/** sMap **

 Extends gMap in markers dataMode. Draws textboxes with heading,
 paragraph, link and image. The idea is to put all columns > 2 into
 the 3. column with html formatting.

 - Data Format 2--6 columns:
   1. lat
   2. long
   3. name  (optional)
   4. text  (optional)
   5. link  (optional)
   6. image (optional)

 - If < 4 columns, then behaves just as gMap
 - Only 6 columns will be read, columns > 6 are ignored.
*/

sgvizler.visualization.sMap = function(container) {this.container = container;};
sgvizler.visualization.sMap.prototype = {
    id:   "sMap",
    name: "Map+",
    draw: function(data, chartOpt) {
        var newData,
            noColumns = data.getNumberOfColumns();

        if(noColumns > 3){
            newData = data.clone();
            // drop columns > 3 from new
            for(var c = noColumns-1; c > 2; c--){
                newData.removeColumn(c);}

            // build new 3. column
            for(var r = 0; r < data.getNumberOfRows(); r++){
                var newValue = "<div class='sgvizler sgvizler-sMap'>";
                newValue += "<h1>" + data.getValue(r,2) + "</h1>";
                if(5 < noColumns && data.getValue(r,5) !== null){
                    newValue += "<div class='img'><img src='" + data.getValue(r,5) + "'/></div>";}
                if(3 < noColumns && data.getValue(r,3) !== null){
                    newValue += "<p class='text'>" + data.getValue(r,3) + "</p>";}
                if(4 < noColumns && data.getValue(r,4) !== null){
                    newValue += "<p class='link'><a href='" + sgvizler.util.unprefixify(data.getValue(r,4)) + "'>" + data.getValue(r,4) + "</a></p>";}
                newValue += "</div>";
                newData.setCell(r, 2, newValue);
            }
        }
        else { // do nothing.
            newData = dDataTable;}

        chart = new google.visualization.Map(this.container);
        chart.draw(newData, chartOpt);
    }
};


/** sList **

 Make a html list, either numbered (ol) or bullets (ul). Each row
 becomes a list item.

 Any number of columns in any format. Everything is displayed as text.

 Available options:
 'list'      :  "ol" / "ul"  (default: "ul")
 'cellSep'   :  string (can be html) to separate cells in row. (default: ', ')
 'rowPrefix  :  string (can be html) to prefix each row with. (default: '')
 'rowPostfix :  string (can be html) to postfix each row with. (default: '')

*/
sgvizler.visualization.List = function(container) {this.container = container;};
sgvizler.visualization.List.prototype = {
    id:   "sList",
    name: "List",
    draw: function(data, chartOpt) {
        var noColumns = data.getNumberOfColumns(),
            noRows = data.getNumberOfRows(),
            opt = $.extend({ list: 'ul', cellSep: ', ', rowPrefix: '', rowPostfix: '' }, chartOpt ),
            list = $(document.createElement(opt.list));

        for(var r = 0; r < noRows; r++){
            var rowtext = opt.rowPrefix;
            for(var c = 0; c < noColumns; c++){
                rowtext += data.getValue(r,c);
                    if(c+1 !== noColumns){
                        rowtext += opt.cellSep; }}
            rowtext += opt.rowPostfix;
            list.append($(document.createElement('li')).html(rowtext));
        }
        $(this.container).empty();
        $(this.container).append(list);
    }
};

/** sDefList **

 Make a html dt list.

 Format, 2--N columns:
 1. Term
 2--N. Definition

 Available options:
 'cellSep'   :  string (can be html) to separate cells in definition columns. (default: ' ')
 'termPrefix  :  string (can be html) to prefix each term with. (default: '')
 'termPostfix :  string (can be html) to postfix each term with. (default: ':')
 'definitionPrefix  :  string (can be html) to prefix each definition with. (default: '')
 'definitionPostfix :  string (can be html) to postfix each definition with. (default: '')

*/
sgvizler.visualization.DefList = function(container) {this.container = container;};
sgvizler.visualization.DefList.prototype = {
    id:   "sDefList",
    name: "Definition List",
    draw: function(data, chartOpt) {
        var noColumns = data.getNumberOfColumns(),
            noRows = data.getNumberOfRows(),
            opt = $.extend({ cellSep: ' ', termPrefix: '', termPostfix: ':', definitionPrefix: '', definitionPostfix: '' }, chartOpt ),
            list = $(document.createElement('dl'));

        for(var r = 0; r < noRows; r++){
            var term = opt.termPrefix + data.getValue(r,0) + opt.termPostfix;
            list.append($(document.createElement('dt')).html(term));
            var definition = opt.definitionPrefix;
            for(var c = 1; c < noColumns; c++){
                definition += data.getValue(r,c);
                    if(c+1 !== noColumns){
                        definition += opt.cellSep; }}
            definition += opt.definitionPostfix;
            list.append($(document.createElement('dd')).html(definition));
        }
        $(this.container).empty();
        $(this.container).append(list);
    }
};

/** sText **

 Write text.

 Any number of columns. Everything is displayed as text.

 Available options:
 'cellSep'       :  string (can be html) to separate cells in each column. (default: ', ')
 'cellPrefix     :  string (can be html) to prefix each cell with. (default: '')
 'cellPostfix    :  string (can be html) to postfix each cell  with. (default: '')
 'rowPrefix      :  string (can be html) to prefix each row with. (default: '<p>')
 'rowPostfix     :  string (can be html) to postfix each row with. (default: '</p>')
 'resultsPrefix  :  string (can be html) to prefix the results with. (default: '<div>')
 'resultsPostfix :  string (can be html) to postfix the results with. (default: '</div>')

*/
sgvizler.visualization.Text = function(container) {this.container = container;};
sgvizler.visualization.Text.prototype = {
    id:   "sText",
    name: "Text",
    draw: function(data, chartOpt) {
        var noColumns = data.getNumberOfColumns(),
            noRows = data.getNumberOfRows(),
            opt = $.extend({ cellSep: ', ',
                             cellPrefix: '', cellPostfix: '',
                             rowPrefix: '<p>', rowPostfix: '</p>',
                             resultsPrefix: '<div>', resultsPostfix: '</div>' },
                           chartOpt ),
            text = opt.resultsPrefix;

        for(var r = 0; r < noRows; r++){
            var row = opt.rowPrefix;
            for(var c = 0; c < noColumns; c++){
                row += opt.cellPrefix + data.getValue(r,c) + opt.cellPostfix;
                    if(c+1 !== noColumns){
                        row += opt.cellSep; }}
            text += row + opt.rowPostfix;
        }
        text += opt.resultsPostfix;

        $(this.container).empty();
        $(this.container).html(text);
    }
};
