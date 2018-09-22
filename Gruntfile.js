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
        tagrelease: {
            file: 'manifest.json',
            commit:  false,
            message: 'Release <%= pkg.version %>',
            annotate: false,
        },
        zip: {
            'long-format': {
                src: ['css/**', 'img/**', '*.js*', '*.css', '*.md', '*.html', 'LICENSE', '!Gruntfile.js', '!package.json'],
                dest: 'builds/<%= pkg.name + "-" + pkg.version %>.zip'
            }
        },
        webstore_upload: {
            "accounts": {
                "default": {
                    publish: true,
                    client_id: process.env.ChromeAPI_clientId,
                    client_secret: process.env.ChromeAPI_clientSecret,
                    refresh_token: process.env.ChromeAPI_refreshToken
                },
                "defaultNoPublish": {
                    publish: false,
                    client_id: process.env.ChromeAPI_clientId,
                    client_secret: process.env.ChromeAPI_clientSecret,
                    refresh_token: process.env.ChromeAPI_refreshToken
                },
            },
            "extensions": {
                "StoPlay": {
                    appID: process.env.extensionId,
                    zip: 'builds/<%= pkg.name + "-" + pkg.version %>.zip'      
                }
            },
            onComplete: function(result) {
                console.log('webstore_upload result', result);
                var firstResult = result[0];
                if (firstResult.success !== true) {
                    grunt.fail.fatal(firstResult.errorMsg);
                }
            }
        }
    });

    // Loading the plugins
    grunt.loadNpmTasks('grunt-bumpup');
    grunt.loadNpmTasks('grunt-tagrelease');
    grunt.loadNpmTasks('grunt-zip');
    grunt.loadNpmTasks('grunt-webstore-upload');

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
    grunt.registerTask('deploy', ['build', 'webstore_upload']);
}
