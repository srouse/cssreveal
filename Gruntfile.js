

module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-react');
    grunt.loadNpmTasks('cssmodeling');

    var configObj = {
        pkg: '<json:package.json>'
    };

    var project_id = 'cssreveal';

    configObj.react = configObj.react || {};
    configObj.react[project_id] = {files:{}}
    configObj.react[project_id].files[
        'dist/_temp/cssreveal_jsx.js']
        = 'app/**/*.jsx';

    configObj.concat = configObj.concat || {};
    configObj.concat[project_id + "_js"] = {
        files: {
            'dist/cssreveal.js':
            [
        		'node_modules/react/dist/react.js',
        		'node_modules/routestate/RouteState.js',
                'node_modules/prettydiff/prettydiff.js',
                'node_modules/jquery/dist/jquery.min.js',
                'node_modules/prettydiff/api/dom.js',
                'cssreveal.js',
                'dist/_temp/**/*.js',
                'app/**/*.js'
            ]
        }
    };
    configObj.concat[project_id + "_less"] = {
        files: {
            'dist/_temp/cssreveal.less':
            [
                'app/**/*.less',
        		'dist/cssmodeling/less/core.less'
            ]
        }
    };


    configObj.cssmodeling = configObj.cssmodeling || {};
    configObj.cssmodeling[project_id] = {
        files: {
            'dist/cssmodeling':
            [
                'cssmodeling/css_schemes.json',
                'cssmodeling/css_rows_quartered.json',
                'cssmodeling/css_12_col_vw_quartered.json',
                'cssmodeling/css_flex_layouts.json',
                'cssmodeling/css_simple.json',
                'cssmodeling/css_skin.json'
            ]
        },
        options: {
            resets:[
                // 'cssmodeling/_resets/**/*.css'
            ],
            type:"less",
            var_prefix:"v-"
        }
    };

    configObj.less = configObj.less || {};
    configObj.less[project_id] = {
        files: {
            'dist/cssreveal.css':
            [
                'dist/_temp/cssreveal.less'
            ]
        }
    };

    configObj.watch = configObj.watch || {};
    configObj.watch[project_id] = {
        files:[
            'app/**/*.jsx',
            'app/**/*.less',
            'app/**/*.js',
            'cssreveal.js'
        ],
        tasks: ["default"]
    };

    /*==========================
    FINAL INIT
    ==========================*/
    grunt.initConfig( configObj );
    grunt.registerTask( 'default' , [
        'react',
        'concat',
        'cssmodeling',
        'less'
    ] );

}
