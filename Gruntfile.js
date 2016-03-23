'use strict';

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
    app: 'editor/frontend',
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
        files: ['editor/frontend/bower.json'],
        tasks: ['wiredep']
      },
      js: {
        files: ['<%= appConfig.app %>/js/{,*/}*.js'],
        tasks: ['newer:jshint:all'],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
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

    shell: {
      options: {
        stdout: true
      },
      npmInstall: {
        command: 'npm install && cd editor && npm install'
      },
      bowerInstall: {
        command: 'cd editor/frontend && bower install && cd ../template && bower install'
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
                connect.static('./editor/frontend/bower_components')
              ),
              connect().use(
                '/fonts',
                connect.static('./editor/frontend/fonts')
              ),
              connect().use(
                  '/artifacts',
                  connect.static('./editor/artifacts')
              ),
              require('grunt-connect-proxy/lib/utils').proxyRequest,
              connect.static(appConfig.app)
            ];
          }
        }
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
            '!<%= appConfig.dist %>/.git{,*/}*'
          ]
        }]
      },
      server: '.tmp'
    },

    // Automatically inject Bower components into the app
    wiredep: {
      app: {
        cwd: 'editor/frontend',
        src: ['<%= appConfig.app %>/{index,404,header,footer}.{html,ejs}'],
        ignorePath:  /\.\.\//,
        exclude: [/bootstrap-sass-official\//]
      },
      sass: {
        cwd: 'editor/frontend',
        src: ['<%= appConfig.app %>/css/{,*/}*.{scss,sass}'],
        ignorePath: /(\.\.\/){1,2}bower_components\//,
        exclude: [/bootstrap-sass-official\//]
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
          cwd: 'editor/frontend/',
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
          ".tmp/css/AdminLTE.css": "editor/frontend/css/AdminLTE/AdminLTE.less" // destination file and source file
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
        importPath: './editor/frontend/bower_components',
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
           ]
         }
       }
     },

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
          cwd: './editor/frontend/bower_components/bootstrap-sass-official/assets/fonts/bootstrap/',
          src: '*',
          dest: '<%= appConfig.dist %>/fonts/'
        }, {
          expand: true,
          cwd: './editor/frontend/bower_components/ionicons/fonts/',
          src: '*',
          dest: '<%= appConfig.dist %>/fonts/'
        },{
          expand: true,
          cwd: './editor/frontend/fonts/',
          src: '*',
          dest: '<%= appConfig.dist %>/fonts/'
        }, {
          expand: true,
          cwd: './editor/frontend/bower_components/font-awesome/fonts/',
          src: '*',
          dest: '<%= appConfig.dist %>/fonts/'
        }, {
          expand: true,
          cwd: './editor/frontend/bower_components/open-sans-fontface/fonts/',
          src: '*/*',
          dest: '<%= appConfig.dist %>/fonts/'
        }, {
          expand: true,
          cwd: './editor/',
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
      'less',
      'compass:server',
      'configureProxies',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('build', [
    'clean:dist',
    'update',
    'wiredep',
    'template',
    'useminPrepare',
    'less',
    'compass:dist',
    'imagemin',
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
    'shell:bowerInstall'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'build'
  ]);

};
