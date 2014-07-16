module.exports = function(config) {
  config.set({

    basePath: '../',

    files: [
      'bower_components/angular/angular.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/lodash/dist/lodash.min.js',
      'bower_components/restangular/dist/restangular.min.js',
      'bower_components/d3/d3.js',
      'bower_components/nvd3/nv.d3.js',
      'bower_components/angularjs-nvd3-directives/dist/angularjs-nvd3-directives.js',
      'app/js/*.js',
      'test/lib/angular/angular-mocks.js',
      'test/unit/**/*.js'
    ],

    autoWatch: true,

    frameworks: ['jasmine'],

    browsers: ['Chrome'],

    plugins: [
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-jasmine'
    ],

    junitReporter: {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};