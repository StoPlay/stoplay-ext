// Task configurations
module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('manifest.json'),
        bumpup: {
            options: {
                updateProps: {
                    pkg: 'manifest.json'
                }
            },
            files: ['manifest.json', 'package.json']
        },
        tagrelease: '<%= pkg.version %>',
        zip: {
            'long-format': {
                src: ['css/**', 'img/**', '*.js*', '*.css', '*.md', '*.html', 'LICENSE', '!Gruntfile.js', '!package.json'],
                dest: 'builds/<%= pkg.name + "-" + pkg.version %>.zip'
            }
        }

    });

    // Loading the plugins
    grunt.loadNpmTasks('grunt-bumpup');
    grunt.loadNpmTasks('grunt-tagrelease');
    grunt.loadNpmTasks('grunt-zip');


    // Alias task for release
    grunt.registerTask('makeRelease', function (type) {
        type = type ? type : 'patch';     // Default release type
        grunt.task.run('bumpup:' + type); // Bump up the version
        grunt.task.run('tagrelease');     // Commit & tag the release
        grunt.task.run('zip');     // Compress an archive
    });

    grunt.registerTask('default', []);
    grunt.registerTask('build', ['makeRelease']);
    grunt.registerTask('pack', ['zip']);
}
