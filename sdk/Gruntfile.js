// # Globbing
// for performance reasons we're only matching one level down:
// 'src/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'src/**/*.js'

module.exports = function (grunt) {
	'use strict';

	// Time how long tasks take. Can help when optimizing build times
	require('time-grunt')(grunt);

	// Configurable paths for the application
	var appConfig = {
		src: 'src',
		dist: 'dist',
		test: 'test'
	};

	// Define the configuration for all the tasks
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> v<%= pkg.version %> | (c) <%= pkg.author %> | <%= grunt.template.today("yyyy-mm-dd") %> | <%= pkg.license %> */\n'
			},
			build: {
				src: [
					'bower_components/promise-polyfill/Promise.js',
					appConfig.src + '/config/Constants.js',
					appConfig.src + '/utilities/Helpers.js',
					appConfig.src + '/utilities/Request.js',
					appConfig.src + '/Client.js',
					appConfig.src + '/utilities/Paginated.js',
					appConfig.src + '/Job.js',
					appConfig.src + '/Printer.js',
					appConfig.src + '/*.js',
					appConfig.src + '/drive/*.js'],
				dest: appConfig.dist + '/<%= pkg.name %><%= version %>.min.js'
			}
		},
		// Test settings
		karma: {
			unit: {
				configFile: 'karma.conf.js',
				singleRun: true,
				browsers: ['PhantomJS2']
			}
		},
		jshint: {
			src: ['Gruntfile.js', 'src/{,*/}*.js'],
			options:{
				jshintrc: '.jshintrc'
			}
		},
		jsdoc : {
			dist : {
				src: ['src/{,*/}*.js','../README.md'],
				options: {
					destination: 'doc',
					template : 'node_modules/grunt-jsdoc/node_modules/ink-docstrap/template',
					configure : 'jsdoc-conf/jsdoc-full.conf.json'
				}
			},
			iframe: {
				src: ['src/{,*/}*.js','../README.md'],
				options: {
					destination: 'doc/iframe',
					template : 'node_modules/ink-docstrap-spark/template',
					configure : 'jsdoc-conf/jsdoc-iframe.conf.json'
				}
			}
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-uglify');

	//Load grunt karma
	grunt.loadNpmTasks('grunt-karma');

	//JShint
	grunt.loadNpmTasks('grunt-contrib-jshint');

	//JSdocs
	grunt.loadNpmTasks('grunt-jsdoc');

	//Our build task
	grunt.registerTask('build', function (version) {

		var pkg = grunt.file.readJSON('package.json');

		var buildVersion;

		switch (version){
			case 'dist':
				buildVersion = '';
				break;
			case 'latest':
			case 'nightly':
				buildVersion = '-nightly';
				break;
			default:
				buildVersion = '-' + pkg.version;
				break;
		}

		grunt.config.set('version', buildVersion);
		grunt.task.run(['jshint:src','karma','uglify']);
	});


	//run tests through grunt
	grunt.registerTask('test', function(){
		grunt.task.run(['karma']);
	});

	grunt.registerTask('docs', function(){
		grunt.task.run(['jshint:src','karma','jsdoc:dist','jsdoc:iframe']);
	});


};
