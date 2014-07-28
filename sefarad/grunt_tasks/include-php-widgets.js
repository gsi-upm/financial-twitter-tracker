var fs = require('fs');

module.exports = function (grunt) {
	grunt.registerTask('include-php-widgets', function () {
		grunt.log.writeln('Incluing widgets');

		var done = this.async();

		var widgetsFile = 'build/php/widgets.txt';
		var sourceFile = 'build/sefarad.html';
		var destinationFile = 'build/index_copia.html';

		// Update widgets to the html file.
		var string1 = '';
		var string2 = '\t\t<script type="text/javascript">\n\t\t\tvar widgetX = [';
		var finalString = '';

		var updateHTML = function () {
			grunt.log.writeln('Writing index.html');

			var data = grunt.file.read(sourceFile);

			var headPosition = data.indexOf('<head>') + '<head>'.length + 1;

			finalString += data.substr(0, headPosition);			
			finalString += string1;
			finalString += string2;
			finalString += data.substr(headPosition + 1, data.length);

			grunt.file.write(destinationFile, finalString);
			
			grunt.log.writeln('Widgets updated.');			
		};

		grunt.log.writeln('Reading widgets');

		var data = grunt.file.read(widgetsFile);
		var widgets = data.split(",");

		widgets.forEach(function(item){
			if(item != ""){
				grunt.log.writeln('Adding widget: ' + item);
				string1 += '\t\t<script type="text/javascript" src="js/widgets/d3/' + item + '"></script>\n';
				string2 += item + ', ';
			}			
		});	

		string2 = string2.substring(0, string2.length - 2);
		string2 += '];\n\t\t</script>\n\t';	

		updateHTML();
		done();

	});
};