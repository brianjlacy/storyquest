'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Disables annoying terminal icon bounces on OSX.
  grunt.option('color', false);

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // load tasks for wait-server
  grunt.loadNpmTasks('grunt-wait-server');
  grunt.loadNpmTasks('grunt-shell');

  // Configurable paths for the application
  var appConfig = {
    app: require('./bower.json').appPath || 'frontend',
    dist: 'dist/static',
    distNode: 'dist'
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    appConfig: appConfig,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      js: {
        files: ['<%= appConfig.app %>/js/{,*/}*.js'],
        tasks: ['newer:jshint:all'],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      jsTest: {
        files: ['test/spec/{,*/}*.js'],
        tasks: ['newer:jshint:test', 'karma']
      },
      compass: {
        files: ['<%= appConfig.app %>/css/{,*/}*.{scss,sass}'],
        tasks: ['compass:server', 'autoprefixer']
      },
      less: {
        files: ['<%= appConfig.app %>/css/{,*/}*.less'],
        tasks: ['less']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      template: {
        files: ['<%= appConfig.app %>/{,*}*.ejs'],
        tasks: ['template']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= appConfig.app %>/{,*/}*.html',
          '.tmp/css/{,*/}*.css',
          '.tmp/{,*/}*.html',
          '<%= appConfig.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    waitServer: {
      waitForSeleniumServer: {
        options: {
          url: 'http://localhost:4444',
          fail: function () { console.error('Failed to start Selenium service.'); },
          timeout: 10 * 1000,
          isforce: false,
          interval: 800,
          print: true
        }
      }
    },

    shell: {
      options: {
        stdout: true
      },
      seleniumStart: {
        command: 'node ./node_modules/protractor/bin/webdriver-manager start --seleniumPort <%= protractor.auto.options.args.seleniumPort %>',
        options: {
          stdout: false,
          async: true,
          // failOnError is not ok, if selenium is already running.
          // On real errors, it will fall in a timeout on waitServer:waitForSeleniumServer
          failOnError: false
        }
      },
      seleniumStop: {
        command: 'curl -s -L http://localhost:<%= protractor.auto.options.args.seleniumPort %>/selenium-server/driver/?cmd=shutDownSeleniumServer',
        options: {
          stdout: false,
          async: true
        }
      },
      protractorInstall: {
        command: 'node ./node_modules/protractor/bin/webdriver-manager update --standalone'
      },
      npmInstall: {
        command: 'npm install'
      },
      bowerInstall: {
        command: 'bower install && cd template && bower install'
      },
      buildOpenLayers: {
        command: 'cd bower_components/openlayers/build && ./build.py'
      }
    },

    styledocco: {
      dist: {
        options: {
          name: 'styleguide',
          cmd: './node_modules/.bin/styledocco',
          include: ['.tmp/css/main.css']
        },
        files: {
          'doc/styleguide': '<%= appConfig.app %>/css'
        }
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9100,
        hostname: '0.0.0.0',
        livereload: 35729
      },
      proxies: [
        {
          context: '/api',
          host: 'localhost',
          port: '3000',
          https: false,
          changeOrigin: false
        },
        {
          context: '/engine.io',
          host: 'localhost',
          port: '3000',
          https: false,
          changeOrigin: false
        }
      ],
      livereload: {
        options: {
          open: false, // Open default browser after grunt start
          middleware: function (connect, options) {
            return [
              connect.static('.tmp'),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
              connect().use(
                '/fonts',
                connect.static('./frontend/fonts')
              ),
              connect().use(
                  '/artifacts',
                  connect.static('./artifacts')
              ),
              require('grunt-connect-proxy/lib/utils').proxyRequest,
              connect.static(appConfig.app)
              /*
              function(req, res) {
                  if (req.url.match(/\/api\/.*$/)) {
                    // serve /api fixtures from dev_fixtures/
                    res.end(grunt.file.read("dev_fixtures/" + req.url.replace("/api/","")));
                  } else if (! req.url.match(/\/$|\./)) {
                      // always return index, if not a file or directory is requested
                      res.end(grunt.file.read('.tmp/index.html'));
                  } else {
                    res.statusCode = 404;
                    // use index also on 404:
                    // Our client side routing takes care of displaying an apropriate error 
                    // message
                    res.end(grunt.file.read('.tmp/index.html'));
                  }
              }
              */
            ];
          }
        }
      },
      test: {
        options: {
          port: 9002,
          middleware: function (connect) {
            return [
              connect.static('.tmp'),
              connect.static('test'),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
              connect.static(appConfig.app)
            ];
          }
        }
      },
      dist: {
        options: {
          open: false, // Open default browser after grunt start
          base: '<%= appConfig.dist %>'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: [
          'Gruntfile.js',
          '<%= appConfig.app %>/js/{,*/}*.js'
        ]
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/{,*/}*.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= appConfig.dist %>/{,*/}*',
            '!<%= appConfig.dist %>/.git{,*/}*',
            'doc/styleguide'
          ]
        }]
      },
      server: '.tmp'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version', 'ie >= 9', 'android >= 4']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/css/',
          src: '{,*/}*.css',
          dest: '.tmp/css/'
        }]
      }
    },

    // Automatically inject Bower components into the app
    wiredep: {
      app: {
        src: ['<%= appConfig.app %>/{index,404,header,footer}.{html,ejs}'],
        ignorePath:  /\.\.\//,
        exclude: [/bootstrap-sass-official\//]
      },
      sass: {
        src: ['<%= appConfig.app %>/css/{,*/}*.{scss,sass}'],
        ignorePath: /(\.\.\/){1,2}bower_components\//,
        exclude: [/bootstrap-sass-official\//]
      }
    },

    ngTemplateCache: {
      views: {
        files: []
      }
    },

    template: {
      dev: {
        options: {
          data: {
            publicPath: grunt.option('publicPath') || '',
            basePath: grunt.option('basePath') || '/',
            appVersion: grunt.option('appVersion') || 'master'
          }
        },
        files: [{
          expand: true,
          cwd: 'frontend',
          src: '*.ejs',
          dest: '.tmp/',
          ext: '.html'
        }]
      }
    },

    // Compiles less to CSS and generates necessary files if requested
    less: {
      development: {
        options: {
          compress: true,
          yuicompress: true,
          optimization: 2
        },
        files: {
          ".tmp/css/AdminLTE.css": "frontend/css/AdminLTE/AdminLTE.less" // destination file and source file
        }
      }
    },

    // Compiles Sass to CSS and generates necessary files if requested
    compass: {
      options: {
        sassDir: '<%= appConfig.app %>/css',
        cssDir: '.tmp/css',
        generatedImagesDir: '.tmp/images/generated',
        imagesDir: '<%= appConfig.app %>/images',
        javascriptsDir: '<%= appConfig.app %>/js',
        fontsDir: '<%= appConfig.app %>/fonts',
        importPath: './bower_components',
        httpImagesPath: '/images',
        httpGeneratedImagesPath: '/images/generated',
        httpFontsPath: '/fonts',
        relativeAssets: false,
        assetCacheBuster: false,
        raw: 'Sass::Script::Number.precision = 10\n',
        require: 'susy'
      },
      dist: {
        options: {
          generatedImagesDir: '<%= appConfig.dist %>/images/generated'
        }
      },
      server: {
        options: {
          debugInfo: true
        }
      }
    },

    // Renames files for browser caching purposes
    filerev: {
      dist: {
        src: [
          '<%= appConfig.dist %>/js/{,*/}*.js',
          '<%= appConfig.dist %>/css/{,*/}*.css',
          '<%= appConfig.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: ['.tmp/editor.html', '.tmp/beta.html', '.tmp/preview.html', '.tmp/preview.html', '.tmp/confirm.html', '.tmp/legal.html', '.tmp/login.html', '.tmp/lostpassword.html', '.tmp/register.html'],
      options: {
        dest: '<%= appConfig.dist %>',
        flow: {
          html: {
            steps: {
              js: ['concat', 'uglifyjs'],
              css: ['cssmin']
            },
            post: {}
          }
        }
      }
    },

    // Performs rewrites based on filerev and the useminPrepare configuration
    usemin: {
      html: ['<%= appConfig.dist %>/{,*/}*.html'],
      css: ['<%= appConfig.dist %>/css/{,*/}*.css'],
      options: {
        assetsDirs: ['<%= appConfig.dist %>','<%= appConfig.dist %>/images']
      }
    },

    // The following *-min tasks will produce minified files in the dist folder
    // By default, your `index.html`'s <!-- Usemin block --> will take care of
    // minification. These next options are pre-configured if you do not wish
    // to use the Usemin blocks.
    cssmin: {
       dist: {
         files: {
           '<%= appConfig.dist %>/css/main.css': [
             '.tmp/css/main.css'
           ],
           '<%= appConfig.dist %>/css/unsupported.css': [
             '.tmp/css/unsupported.css'
           ],
           '<%= appConfig.dist %>/css/vendor.css': [
             '.tmp/css/vendor.css'
           ]
         }
       }
     },
     //uglify: {
     //  dist: {
     //    files: {
     //      '<%= appConfig.dist %>/js/scripts.js': [
     //        '<%= appConfig.dist %>/js/scripts.js'
     //      ]
     //    }
     //  }
     //},
     //concat: {
     //  dist: {}
     //},

    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= appConfig.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= appConfig.dist %>/images'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= appConfig.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%= appConfig.dist %>/images'
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true,
          conservativeCollapse: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true
        },
        files: [{
          expand: true,
          cwd: '<%= appConfig.dist %>',
          src: ['editor.html', 'beta.html', 'preview.html', 'confirm.html', 'legal.html', 'login.html', 'lostpassword.html', 'register.html', 'views/{,*/}*.html'],
          dest: '<%= appConfig.dist %>'
        }]
      }
    },

    // ng-annotate tries to make the code safe for minification automatically
    // by using the Angular long form for dependency injection.
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/js',
          src: ['*.js', '!oldieshim.js'],
          dest: '.tmp/concat/js'
        }]
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [
        {
          expand: true,
          dot: true,
          cwd: '<%= appConfig.app %>',
          dest: '<%= appConfig.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            'editor.html',
            'beta.html',
            'preview.html',
            'confirm.html',
            'legal.html',
            'index.html',
            'login.html',
            'lostpassword.html',
            'register.html',
            'views/{,*/}*.html',
            'images/**/*',
            'media/{,*/}*.*',
            'i18n/{,*/}*.*'
          ]
        }, {
           expand: true,
           cwd: './frontend/js',
           dest: '<%= appConfig.dist %>/js/',
           src: ['snippets/markdown.js']
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= appConfig.dist %>/images',
          src: ['generated/*']
        }, {
          expand: true,
          cwd: '.tmp',
          dest: '<%= appConfig.dist %>',
          src: ['editor.html',
            'beta.html',
            'preview.html',
            'confirm.html',
            'legal.html',
            'login.html',
            'lostpassword.html',
            'register.html']
        }, {
          expand: true,
          cwd: './bower_components/bootstrap-sass-official/assets/fonts/bootstrap/',
          src: '*',
          dest: '<%= appConfig.dist %>/fonts/'
        }, {
          expand: true,
          cwd: './bower_components/ionicons/fonts/',
          src: '*',
          dest: '<%= appConfig.dist %>/fonts/'
        },{
          expand: true,
          cwd: './frontend/fonts/',
          src: '*',
          dest: '<%= appConfig.dist %>/fonts/'
        }, {
          expand: true,
          cwd: './bower_components/font-awesome/fonts/',
          src: '*',
          dest: '<%= appConfig.dist %>/fonts/'
        }, {
          expand: true,
          cwd: './bower_components/open-sans-fontface/fonts/',
          src: '*/*',
          dest: '<%= appConfig.dist %>/fonts/'
        }, {
          expand: true,
          cwd: './',
          src: [
              'mailtemplates/*',
              'service/**/*',
              'template/**/*',
              'storyquest.js',
              'package.json',
              'Dockerfile',
              'README.md',
              'LICENSE'
          ],
          dest: '<%= appConfig.distNode %>'
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= appConfig.app %>/css',
        dest: '.tmp/css/',
        src: '{,*/}*.css'
      }
    },

    // compress final dist
    compress: {
        main: {
            options: {
                archive: 'builds/storyquest-git-' + new Date().getTime() + '.zip'
            },
            files: [
                {expand: true, cwd: 'dist/', src: '**/*', dest: '/'}
            ]
        }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'less',
        'compass:server'
      ],
      test: [
        'less',
        'compass'
      ],
      dist: [
        'less',
        'compass:dist',
        'imagemin',
        'svgmin'
      ]
    },

    // Test settings
    karma: {
      unit: {
        configFile: 'test/karma.conf.js',
        singleRun: true
      }
    },

    protractor: {
      options: {
        configFile: 'test/protractor.conf.js'
      },
      singlerun: {
        singleRun: true
      },
      auto: {
        keepAlive: true,
        options: {
          args: {
            seleniumPort: 4444
          }
        }
      }
    }

  });


  grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'wiredep',
      'template',
      'concurrent:server',
      'autoprefixer',
      'configureProxies',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('test', [
    'clean:server',
    'concurrent:test',
    'autoprefixer',
    'connect:test',
    'karma'
  ]);

  grunt.registerTask('test:e2e', [
    'connect:test',
    'shell:seleniumStart',
    'waitServer:waitForSeleniumServer',
    'protractor:singlerun',
    'shell:seleniumStop'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'update',
    'wiredep',
    'template',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'concat', // Task created by useminPrepare
    'ngAnnotate',
    'copy:dist',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin',
    'compress'
  ]);

  //installation-related
  grunt.registerTask('install', [
    'update','shell:protractorInstall'
  ]);

  grunt.registerTask('update', [
    'shell:npmInstall',
    'shell:bowerInstall',
    'shell:buildOpenLayers'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);

  grunt.registerTask('build-styleguide', [
    'compass:dist',
    'styledocco'
  ]);
};
