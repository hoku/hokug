
module.exports = function(grunt) {
	var pkg = grunt.file.readJSON('package.json');

	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		cssmin: {
			compress: {
				files: {
					'./build/css/<%= pkg.name %>.css': ['css/*.css']
				}
			}
		},
		// js結合
		concat: {
			options: {
				separator: ';'
			},
			dist: {
				src: ['js/*.js'],
				dest: './build/js/<%= pkg.name %>.js'
			}
		},
		// js圧縮
		uglify: {
			options: {
				banner:
					'/**\n' +
					' * <%= pkg.name %> v<%= pkg.version %>\n' +
					' * <%= pkg.url %>\n' +
					' *\n' +
					' * Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author %>.\n' +
					' * Released under the <%= pkg.license %>.\n'+
					' */\n\n'
			},
			dist: {
				files: {
					'./build/js/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
				}
			}
		},
		// テスト
		qunit: {
			files: ['test/*.html']
		},
		// チェック
		jshint: {
			files: ['gruntfile.js', 'js/*.js', 'test/*.js']
		},
		// 監視
		watch: {
			files: ['<%= jshint.files %>'],
			tasks: ['jshint', 'qunit']
		}
	});

	var taskName;
	for(taskName in pkg.devDependencies) {
		if(taskName.substring(0, 6) == 'grunt-') {
			grunt.loadNpmTasks(taskName);
		}
	}

	// grunt test
	grunt.registerTask('test', ['jshint', 'qunit']);

	// grunt
	grunt.registerTask('default', ['jshint', 'qunit', 'cssmin', 'concat', 'uglify']);
};
