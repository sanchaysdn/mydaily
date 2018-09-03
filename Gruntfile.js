module.exports = function(grunt) {

 var projectjsfile = [
      'public/admin/javascripts/app.js', 
      'public/admin/modules/authentication/controller.js',
      'public/admin/modules/authentication/service.js',
      'public/admin/javascripts/ngTableParamsService.js',
      'public/admin/javascripts/loggerServices.js',
      'public/admin/modules/home/controller.js',
      'public/admin/modules/home/homeService.js',
      'public/admin/modules/users/controller.js',
      'public/admin/modules/users/service.js',
      'public/admin/modules/schools/controller.js',
      'public/admin/modules/schools/service.js',
      'public/admin/javascripts/communication.js',
      'public/admin/javascripts/directives/directives.js',
      'public/admin/modules/products/controller.js',
      'public/admin/modules/products/service.js',
      'public/admin/modules/orders/controller.js',
      'public/admin/modules/orders/service.js',
      'public/admin/javascripts/constants.js',
      'public/admin/modules/cms/controller.js',
      'public/admin/modules/cms/service.js',
 ];    

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: ['app.js', 'server/**/*.js']
        },
        watch: {
            scripts: {
                files: projectjsfile,
                tasks: ['concat','uglify'],
                options: {
                    livereload: true,
                    spawn: false,
                },
            }
        },
        nodemon: {
            dev: {
                script: './bin/www',
                tasks: ['watch']
            }
        },
        concat: {
            options: {
                separator: '\n;\n\n'
            },
           dist: {
               src: [
                   "public/assets/js/jQuery-2.1.4.min.js",
                   "public/assets/js/bootstrap.min.js",
                   "public/assets/js/angularjs.min.1.4.8.js",
                   "public/bower_components/angular-ui-router/release/angular-ui-router.min.js",
                   "public/assets/js/angular-route.min.js",
                   "public/assets/js/logger.min.js",
                   "public/assets/js/bootbox.min.js",
                   "public/assets/js/ngStorage.min.js",
                   "public/assets/js/ng-table.min.js",
                   "public/bower_components/angular-resource/angular-resource.min.js",
                   "public/assets/fancybook/jquery.fancybox.pack.js",
                   "public/assets/js/ui-bootstrap-tpls-1.1.2.min.js",
                   "public/assets/js/jquery.raty.js",
                   "public/bower_components/angular-ui-tinymce/src/tinymce.js"
                   
               ],
               dest: 'public/gruntFile/user/distLib.js',
           }
        },
        uglify: {
            options: {
                mangle: false
            },
            build: {
                files: {
                    'public/gruntFile/user/built.js': projectjsfile
                }
            }
        },
        concat_css: {
          options: {
            // Task-specific options go here. 
          },
          all: {
            src: [
                "public/assets/css/bootstrap.min.css", 
                "public/assets/css/logger.css", 
                "public/assets/css/AdminLTE.css", 
                "public/assets/css/ng-table.min.css", 
                // "public/assets/fancybook/jquery.fancybox.css", 
            ],
            dest: "public/gruntFile/user/built.css"
          },
        }
    });
    // loading tasks modules
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-minified');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-concat-css');
    grunt.loadNpmTasks('grunt-stripcomments');
    // registerTask
    grunt.registerTask("default", ["nodemon:dev"]);
    grunt.registerTask("con", ["concat", "uglify"]);
};
