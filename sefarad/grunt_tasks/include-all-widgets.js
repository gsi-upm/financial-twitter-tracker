var fs = require('fs');

module.exports = function (grunt) {
	grunt.registerTask('include-all-widgets', function () {
		grunt.log.writeln('Incluing widgets');

		var done = this.async();

		var widgetsPath = 'src/js/widgets/d3';
		var sourceFile = 'build/index.html';
		var destinationFile = 'build/index.html';

		// Update widgets to the html file.
		var string1 = '';
		var string2 = '\t\t<script type="text/javascript">\n\t\t\tvar widgetX = [';
		var finalString = '';

		var updateHTML = function () {
			grunt.log.writeln('Writing sefarad');

			var data = grunt.file.read(sourceFile);

			var headPosition = data.indexOf('<head>') + '<head>'.length + 1;

			finalString += data.substr(0, headPosition);			
			finalString += string1;
			finalString += string2;
			finalString += data.substr(headPosition + 1, data.length);

			grunt.file.write(destinationFile, finalString);
			
			grunt.log.writeln('Widgets updated.');			
		};

		fs.readdir(widgetsPath, function (err, files) {
			grunt.log.writeln('Reading _sefarad');

			if (err) {
				grunt.log.writeln(err);
			} else {
				for (var i = 0; i < files.length; i++) {
					string1 += '\t\t<script type="text/javascript" src="js/widgets/d3/' + files[i] + '"></script>\n';
					string2 += files[i].substring(0, files[i].length - 3) + ', ';
				}

				string2 = string2.substring(0, string2.length - 2);
				string2 += '];\n\t\t</script>\n\t';

			}

			updateHTML();
			done();
		});
	});
};