// Do grunt-related things in here
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    processhtml: {
      templates: {
        files: {
          'build/index.html': ['src/sefarad.html']
        }
      },
      php_widgets: {
        files: {
          'build/sefarad.html': ['src/sefarad.html']
        }
      },
      universitiesDemo: {
        files: {
          'build/js/mvvm.js': ['src/js/mvvm.js']
        }
      },
    },
    copy: {
      main: {
        expand: true,
        cwd: 'src/',
        src: ['ajax-solr/**','css/**','img/**','js/**','php/**','sefarad.html','!js/widgets/widget_template.js'],
        dest: 'build/',
      },
      universitiesDemo: {
        expand: true,
        cwd: 'src/demos/universitiesDemo/',
        src: 'demo.html',
        dest: 'build/',
        // rename: function(dest, src) {
        //   return dest + 'demo.html';
        // },
      },
    },
    clean: {
      build: {
        src: ['build/*','!.gitignore'],
      }
    }, 
  });

  // Load plugins and tasks.
  grunt.loadTasks('grunt_tasks');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');


  // Tasks. 
  grunt.registerTask('default', ['clean:build','processhtml:templates','include-all-widgets','copy:main']);
  grunt.registerTask('demo', ['default','processhtml:universitiesDemo','processhtml:php_widgets', 'copy:universitiesDemo']);
  grunt.registerTask('php', ['include-php-widgets']);

};  