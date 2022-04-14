// Task configurations
module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("manifest.json"),

    bumpup: {
      options: {
        updateProps: {
          pkg: "manifest.json",
        },
      },
      files: ["manifest.json", "package.json"],
    },

    release: {
      options: {
        bump: false,
        file: "manifest.json",
        additionalFiles: ["package.json"],
        push: false,
        pushTags: false,
        npm: false,
        tagName: "v-<%= version %>",
        commitMessage: "Release <%= version %>",
        tagMessage: "Release <%= version %>",
      },
    },

    rollup: {
      options: {
        format: "iife",
      },
      dist: {
        files: {
          "./dist/content.js": "./src/content/index.js",
          "./dist/common.js": "./src/common/index.js",
          "./dist/background.js": "./src/background/index.js",
        },
      },
    },

    watch: {
      scripts: {
        files: ["src/**/*.js"],
        tasks: ["rollup"],
        options: {
          spawn: false,
        },
      },
    },

    zip: {
      "long-format": {
        src: [
          "img/**",
          "dist/**",
          "vendors/**",
          "manifest.json",
          "LICENSE",
          "!Gruntfile.js",
          "!package.json",
        ],
        dest: 'builds/<%= pkg.name + "-" + pkg.version %>.zip',
      },
    },

    exec: {
      copy_options: "cp -r src/options dist/",
      fork_release: "git checkout -b release/<%= pkg.version %>",
      push_release: "git push origin release/<%= pkg.version %>",
      merge_release_back:
        "git checkout develop && git merge release/<%= pkg.version %> && git push",
      help_text:
        'echo "For development (will compile js and start watcher):\n$ grunt pack && grunt\n\nTo start release flow:\n$ grunt makeRelease"',
    },

    webstore_upload: {
      accounts: {
        default: {
          publish: true,
          client_id: process.env.ChromeAPI_clientId,
          client_secret: process.env.ChromeAPI_clientSecret,
          refresh_token: process.env.ChromeAPI_refreshToken,
        },
        defaultNoPublish: {
          publish: false,
          client_id: process.env.ChromeAPI_clientId,
          client_secret: process.env.ChromeAPI_clientSecret,
          refresh_token: process.env.ChromeAPI_refreshToken,
        },
      },
      extensions: {
        StoPlay: {
          appID: process.env.extensionId,
          zip: 'builds/<%= pkg.name + "-" + pkg.version %>.zip',
        },
      },
      onComplete: function (result) {
        console.log("webstore_upload result", result);
        var firstResult = result[0];
        if (firstResult.success !== true) {
          grunt.fail.fatal(firstResult.errorMsg);
        }
      },
    },
  });

  // Loading the plugins
  grunt.loadNpmTasks("grunt-exec");
  grunt.loadNpmTasks("grunt-bumpup");
  grunt.loadNpmTasks("grunt-release");
  grunt.loadNpmTasks("grunt-zip");
  grunt.loadNpmTasks("grunt-rollup");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-webstore-upload");

  // Prepare release branch
  grunt.registerTask("makeRelease", function (type) {
    type = type ? type : "patch"; // Default release type
    grunt.task.run("bumpup:" + type);
    grunt.task.run("exec:fork_release");
    grunt.task.run("release");
    grunt.task.run("exec:push_release");
  });

  grunt.registerTask("default", ["watch"]);
  grunt.registerTask("pack", ["rollup", "exec:copy_options", "zip"]);
  grunt.registerTask("help", ["exec:help_text"]);
  // to start release run this one
  grunt.registerTask("build", ["makeRelease"]);
  // only should be run by CI, not manually
  grunt.registerTask("deploy", [
    "pack",
    "webstore_upload",
    "exec:merge_release_back",
  ]);
};
