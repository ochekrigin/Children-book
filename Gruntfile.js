// Generated on 2015-07-31 using generator-sliceart 0.0.0
'use strict';

module.exports = function (grunt) {

	var bowerJSON = grunt.file.readJSON('bower.json'),
		bowerFolder = 'bower_components/';

	function runCommand (command, done) {
		grunt.util.spawn(command, function (err, result, code) {
			grunt.log.writeln(result);
			if (err) {
				grunt.fail.warn(err);
			}
			if (done) {
				done();
			}
		});
	}

	function copyBowerFiles(fileType, target, returnArr, uglify) {
		"use strict";

		var mainPaths = [],
			plgBowerObj = {},
			postfix = '',
			result = [],
			i,
			j,
			destString = '',
			plgName = '',
			tempObj = {},
			folder = '',
			regExpParam = {
				'js': /\.js$/,
				'css': /\.css$/,
				'images': /(\.(png|jpg|gif|svg)$)|((\.\{)+((gif|png|jpg|svg|,)+\})$)/,
				'other': /\w/
			},
			renameFunc = function (dest, src) { // add .min.js for all css and js files
				src = src.replace('.src.', '.');
				return dest + (new RegExp('\\.min\\.' + fileType + '$').test(src) ? src : src.replace('.' + fileType, '.min.' + fileType));
			};
		// setup variables
		fileType = (typeof fileType === 'string' && /^(css|js|images|other)/.test(fileType)) ? fileType : 'js';
		target = (typeof target === 'string' && /^(markup|build|default)/.test(target)) ? target : 'markup';
		returnArr = /^arr/.test(returnArr);
		uglify = uglify ? true : false;
		folder = target === 'build' ? '<%=config.build%>/' : '<%=config.markup%>/';
		// start
		for (plgName in bowerJSON.dependencies) {
			if (bowerJSON.dependencies.hasOwnProperty(plgName)) {
				if (grunt.file.exists(bowerFolder + plgName + '/bower.json') && !(bowerJSON.files[plgName] && bowerJSON.files[plgName][fileType])) { // plugin bower exist and project bower files, for this plugin, is empty
					plgBowerObj = grunt.file.readJSON(bowerFolder + plgName + '/bower.json');
					if (plgBowerObj.hasOwnProperty('main')) {
						mainPaths = plgBowerObj.main; // get main path(s) from bower json
						if (typeof mainPaths === 'string') { // check string or array
							mainPaths = [mainPaths]; // transform main path to array
						}
						if (fileType === 'js' || fileType === 'css') { // only css and js file types
							if (returnArr) { // setup result array. return type is array with path(s)
								for (i = 0; i < mainPaths.length; i++) {
									if (regExpParam[fileType].test(mainPaths[i]) && plgName !== 'jquery' && plgName !== 'respond') {
										// setup result array
										result.push(bowerFolder + plgName + '/' + mainPaths[i]);
									}
								}
							} else if (plgName !== 'respond') { // setup result array. return type is array with object(s)
								switch (target) {
								case "build":
								case "markup": // setup result array for BUILD and MARKUP version
									for (i = 0; i < mainPaths.length; i++) {
										if (regExpParam[fileType].test(mainPaths[i])) {
											postfix = '';
											if (/\b/.test(mainPaths[i]) && !returnArr) { // get clear file and postfix file
												if (mainPaths[i].lastIndexOf('/') !== -1) {
													postfix = mainPaths[i].slice(0, mainPaths[i].lastIndexOf('/'));
												}
												mainPaths[i] = mainPaths[i].slice(mainPaths[i].lastIndexOf('/') + 1, mainPaths[i].length);
											}
											if (fileType === 'js') {
												destString = folder + 'js/' + (target === 'markup' ? (plgName === 'jquery' ? '' : 'plugins/') : '');
											} else {
												destString = folder + 'css/' + (target === 'markup' ? plgName + '/' : '');
											}
											tempObj = {
												expand: true,
												cwd: bowerFolder + plgName + '/' + postfix,
												src: mainPaths[i],
												dest: destString
											};
											if (uglify) {
												tempObj.rename = renameFunc;
											}
											// setup result array
											result.push(tempObj);
										}
									}
									break;
								default:
									result = [];
								}
							}
						}
					}
				} else if (grunt.file.isDir(bowerFolder + plgName) && bowerJSON.files[plgName] && bowerJSON.files[plgName][fileType]) { // plugin bower not exist, but we have folder and files path(s)
					tempObj = bowerJSON.files[plgName][fileType];
					if (!(tempObj instanceof Array)) { // check array or object
						tempObj = [tempObj];
					}
					if (returnArr) { // setup result array. return type is array with path(s)
						for (i = 0; i < tempObj.length; i++) {
							var innerTempObj = tempObj[i];
							if (typeof innerTempObj.paths === 'string') { // check string or array
								innerTempObj.paths = [innerTempObj.paths];
							}
							for (j = 0; j < innerTempObj.paths.length; j++) {
								if (regExpParam[fileType].test(innerTempObj.paths[j]) && plgName !== 'jquery' && plgName !== 'respond') {
									// setup result array
									result.push(bowerFolder + plgName + '/' + innerTempObj.cwd + innerTempObj.paths[j]);
								}
							}
						}
					} else if (plgName !== 'respond') { // setup result array. return type is array with object(s)
						switch (target) {
						case 'build': // setup result array for BUILD version
						case 'markup': // setup result array for MARKUP version
							for (i = 0; i < tempObj.length; i++) {
								var innerTempObj = tempObj[i];
								mainPaths = [];
								if (typeof innerTempObj.paths === 'string') { // check string or array
									innerTempObj.paths = [innerTempObj.paths];
								}
								for (j = 0; j < innerTempObj.paths.length; j++) {
									if (regExpParam[fileType].test(innerTempObj.paths[j])) {
										mainPaths.push(innerTempObj.paths[j]);
									}
								}
								innerTempObj.dest = innerTempObj.dest || '';
								destString = folder + (target === 'build' ? '' : (fileType === 'js' && !innerTempObj.dest ? 'js/plugins/' : '')) + innerTempObj.dest;
								innerTempObj = {
									expand: true,
									cwd: bowerFolder + plgName + '/' + innerTempObj.cwd,
									src: mainPaths,
									dest: destString
								};
								if (uglify && /^(css|js)/.test(fileType)) {
									innerTempObj.rename = renameFunc;
								}
								// setup result array
								result.push(innerTempObj);
							}
							break;
						default:
							result = [];
						}
					}
				} else if (!grunt.file.isDir(bowerFolder + plgName)) { // plugin is not install
					grunt.fail.warn('Please run "bower install ' + plgName + '" or "bower update".');
				} else {
					// grunt.fail.warn('Please check yours bower.json');
				}
			}
		}

		return result;
	}

	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		config: {
			dev: 'app',
			build: 'build',
			markup: 'markup',
			/* css files */
			cssFiles: '<%=config.dev%>/css/{,**/}*.css',
			cssFilesM: '<%=config.markup%>/css/{,**/}*.css',
			cssFilesB: '<%=config.build%>/css/{,**/}*.css',
			/* sass files */
			sassFiles: '<%=config.dev%>/sass/{,**/}*.{scss,sass}',
			/* less files */
			lessFiles: '<%=config.dev%>/less/{,**/}*.less',
			/* js files */
			jsFiles: '<%=config.dev%>/js/*.js',
			jsFilesAll: '<%=config.dev%>/js/{,**/}*.js',
			jsFilesAllB: '<%=config.build%>/js/{,**/}*.js',
			/* image files */
			imgFiles: '<%=config.dev%>/images/{,**/}*.{gif,jpeg,jpg,png}',
			/* html files */
			htmlFiles: '<%=config.dev%>/{,**/}*.html',
			htmlFilesB: '<%=config.build%>/{,**/}*.html',
			/* jade files */
			jadeFiles: '<%=config.dev%>/{,**/}*.jade'
		},
		compass: {
			dev: {
				options: {
					relativeAssets: true,
					outputStyle: 'expanded',
					noLineComments: true,
					sassDir: '<%=config.dev%>/sass/',
					cssDir: '<%=config.dev%>/css/',
					imagesDir: '<%=config.dev%>/images/',
					fontsDir: '<%=config.dev%>/fonts/'
				}
			},
			markup: {
				options: {
					relativeAssets: true,
					outputStyle: 'expanded',
					noLineComments: true,
					sassDir: '<%=config.dev%>/sass/',
					cssDir: '<%=config.markup%>/css/',
					imagesDir: '<%=config.markup%>/images/',
					fontsDir: '<%=config.markup%>/fonts/'
				}
			},
			build: {
				options: {
					relativeAssets: true,
					outputStyle: 'compressed',
					sassDir: '<%=config.dev%>/sass/',
					cssDir: '<%=config.build%>/css/',
					imagesDir: '<%=config.build%>/images/',
					fontsDir: '<%=config.build%>/fonts/'
				}
			}
		},
		cssmin: {
			combine: {
				options: {
					banner: '/*! <%=pkg.name%> - v<%=pkg.version%> - ' + '<%=grunt.template.today("yyyy-mm-dd")%> */',
					keepSpecialComments: 0
				},
				files: {
					'<%=config.build%>/css/<%=pkg.name%>.min.css': copyBowerFiles('css', 'build', 'arr').concat(['<%=config.dev%>/css/{,/**/}*.css', '!<%=config.dev%>/css/ie{,9}.css']),
					'<%=config.build%>/css/ie.css': ['<%=config.dev%>/css/ie.css'],
					'<%=config.build%>/css/ie9.css': ['<%=config.dev%>/css/ie9.css']
				}
			}
		},
		connect: {
			options: {
				port: 9000,
				open: true,
				livereload: 35729,
				// Change this to '0.0.0.0' to access the server from outside
				hostname: 'localhost'
			},
			livereload: {
				options: {
					open: {
						target: 'http://localhost:9000/<%=config.dev%>/'
					}
				}
			}
		},
		imagemin: {
			build: {
				files: [{
					expand: true,
					cwd: '<%= config.dev %>/images',
					src: '{,**/}*.{gif,jpeg,jpg,png}',
					dest: '<%= config.build %>/images'
				}]
			},
			markup: {
				files: [{
					expand: true,
					cwd: '<%= config.dev %>/images',
					src: '{,**/}*.{gif,jpeg,jpg,png}',
					dest: '<%= config.markup %>/images'
				}]
			}
		},
		concat: {
			options: {
				separator: '\n\r;'
			},
			build: {
				src: [
				'<%=config.dev%>/js/jquery.custom-select.js',
				'<%=config.dev%>/js/jquery.form-validator.js',
				'<%=config.dev%>/js/jquery.carousel.js',
				'<%=config.dev%>/js/jquery.init-book-gallery.js',
				'<%=config.dev%>/js/jquery.show-error.js',
				'<%=config.dev%>/js/jquery.ajax-setup.js',
				'<%=config.dev%>/js/jquery.buy.js',
				'<%=config.dev%>/js/experiments.js',
				'<%=config.dev%>/js/plugins/*.js',
				'<%=config.dev%>/js/jquery.utilities.js'].concat(copyBowerFiles('js', 'build', 'arr').concat('<%=config.dev%>/js/jquery.common.js').concat('<%=config.dev%>/js/jquery.data-edit.js')),
				dest: '<%=config.build%>/js/<%=pkg.name%>.min.js'
			}
		},
		uglify: {
			build: {
				files: [{
					expand: true,
					cwd: '<%=config.build%>/',
					src: ['js/<%=pkg.name%>.min.js'],
					dest: '<%=config.build%>/'
				}]
			},
			markup: {
				files: copyBowerFiles('js', 'markup', '', true, '<%=config.markup%>')
			}
		},
		jshint: {
			options:{
				jshintrc: '.jshintrc'
			},
			src: ['<%=config.jsFiles%>']
		},
		csslint: {
			options: {
				csslintrc: '.csslintrc'
			},
			dev: {
				src: ['<%=config.cssFiles%>']
			},
			markup: {
				src: ['<%=config.cssFilesM%>']
			},
			build: {
				src: ['<%=config.cssFilesB%>']
			}
		},
		clean: {
			markup: ["<%=config.markup%>"],
			build: ["<%=config.build%>"],
			css: ["<%=config.dev%>/css"]
		},
		copy: {
			allB: {
				files: [{
					expand: true,
					cwd: '<%=config.dev%>/',
					src: ['**', '!{,**/}*.html', '!css/**', '!jade/**', '!images/**', '!js/**', '!sass/**', '!less/**'],
					dest: '<%=config.build%>/'
				}].concat(copyBowerFiles('images', 'build', '', false, '<%=config.build%>'), copyBowerFiles('other', 'build', '', false, '<%=config.build%>'))
			},
			jsB: {
				files: [{
					expand: true,
					cwd: 'bower_components/jquery/dist/',
					src: ['jquery.min.js'],
					dest: '<%=config.build%>/js/'
				}]
			},
			allImages: {
				files: [{
					expand: true,
					cwd: '<%=config.dev%>/',
					src: ['images/**'],
					dest: '<%=config.markup%>/'
				}]
			},
			allM: {
				files: [{
					expand: true,
					cwd: '<%=config.dev%>/',
					src: ['**', '!{,**/}*.html', '!css/**', '!jade/**', '!images/**'],
					dest: '<%=config.markup%>/'
				}].concat(copyBowerFiles('css', 'markup', false, false, '<%=config.markup%>'), copyBowerFiles('images', 'markup', false, false, '<%=config.markup%>'), copyBowerFiles('other', 'markup', false, false, '<%=config.markup%>'))
			},
			jsM: {
				files: copyBowerFiles('js', 'markup', false, false, '<%=config.markup%>')
			}
		},
		processhtml: {
			options: {
				strip: true
			},
			markup: {
				options: {
					data: {
						ie: ''
					}
				},
				expand: true,
				cwd: '<%=config.dev%>/',
				src: ['{,**/}*.html'],
				dest: '<%=config.markup%>/'
			},
			build: {
				options: {
					data: {
						ie: ''
					}
				},
				expand: true,
				cwd: '<%=config.dev%>/',
				src: ['{,**/}*.html'],
				dest: '<%=config.build%>/'
			}
		},
		jade: {
			options: {
				pretty: true
			},
			dev: {
				expand: true,
				cwd: '<%=config.dev%>/jade/',
				src: ['{,**/}*.jade', '!modules/**', '!dev/**'],
				dest: '<%=config.dev%>/',
				ext: '.html'
			},
			markup: {
				expand: true,
				cwd: '<%=config.dev%>/jade/',
				src: ['{,**/}*.jade', '!modules/**', '!dev/**'],
				dest: '<%=config.markup%>/',
				ext: '.html'
			},
			build: {
				expand: true,
				cwd: '<%=config.dev%>/jade/',
				src: ['{,**/}*.jade', '!modules/**', '!dev/**'],
				dest: '<%=config.build%>/',
				ext: '.html'
			}
		},
		watch: {
			bower: {
				files: ['bower.json']
			},
			livereload: {
				options: {
					livereload: '<%=connect.options.livereload%>'
				},
				files: [
					'<%=config.htmlFiles%>',
					'<%=config.cssFiles%>',
					'<%=config.jsFilesAll%>',
					'<%=config.imgFiles%>'
				]
			},
			jade: {
				files: ['<%=config.jadeFiles%>'],
				tasks: ['jade:dev']
			},
			scripts: {
				files: ['<%=config.jsFiles%>'],
				tasks: ['jshint']
			},
			css: {
				files: ['<%=config.cssFiles%>'],
				tasks: ['csslint:dev']
			},
			compass: {
				files: ['<%=config.sassFiles%>'],
				tasks: ['clean:css', 'compass:dev']
			}
		}
	});

	grunt.event.on('watch', function(action, filepath, target) {
		switch (target) {
			case 'bower':
				runCommand({
					cmd: 'bower',
					args: ['update']
				});
				break;
			default:
		}
	});

	grunt.registerTask('default', function () {
		// runCommand({
		// 	cmd: 'bower',
		// 	args: ['update']
		// }, this.async());
		grunt.task.run([
			'jshint',
			'clean:css',
			'compass:dev',
			'csslint:dev',
			'connect',
			'jade:dev',
			'watch'
		]);
	});
	grunt.registerTask('markup', function () {
		grunt.task.run([
			'clean:markup',
			'jade:dev',
			'processhtml:markup',
			'jshint',
			'imagemin:markup',
			'compass:markup',
			'csslint:markup',
			'copy:allM',
			'uglify:markup'
		]);
	});
	grunt.registerTask('markup-no-imagemin', function () {
		grunt.task.run([
			'clean:markup',
			'jade:dev',
			'processhtml:markup',
			'jshint',
			'copy:allImages',
			'compass:markup',
			'csslint:markup',
			'copy:allM',
			'uglify:markup'
		]);
	});
	grunt.registerTask('build', function () {
		grunt.task.run([
			'clean:build',
			'jade:dev',
			'processhtml:build',
			'jshint',
			'imagemin:build',
			'concat:build',
			'uglify:build',
			'clean:css',
			'compass:dev',
			'csslint:dev',
			'cssmin',
			'copy:allB',
			'copy:jsB'
		]);
	});
};