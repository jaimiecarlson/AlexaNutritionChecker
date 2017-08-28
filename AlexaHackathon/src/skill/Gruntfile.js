var brazil = require('brazilgrunt');

module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    ws: brazil.ws,
    distDir: '<%= ws.commonJsLibDir %>/<%= ws.packageName %>',
    copy: {
      all: {
        files: [
          {src: '<%= ws.packageName %>/**/*', dest: '<%= ws.commonJsLibDir %>/'},
          {src: 'sam/template.yml', dest: 'build/'}
        ]
      }
    },
    clean: {
        options: {
            force: true
        },
        subfolders: ['build/*']
    }
  });

  // Load Grunt plugins declared in your `test-dependencies`
  grunt.loadBrazilTasks('grunt-contrib-copy');
  grunt.loadBrazilTasks('grunt-contrib-clean');

  // 'default' is the default task when brazil-build is executed.
  grunt.registerTask('default', ['copy']);
};
