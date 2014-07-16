'use strict';

var PARTIAL_ROOT = '/app/partials';

var gobiApp = angular.module('GobiSmartHome', ['ngRoute', 'ngAnimate',
  'gobiControllers', 'gobiServices', 'nvd3ChartDirectives', 'LocalStorageModule', 'restangular', 'colorpicker.module'
]).
config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.when('/', {
      templateUrl: PARTIAL_ROOT + '/overview/index.html',
      controller: 'OverviewCtrl'
    });
    $routeProvider.when('/login', {
      templateUrl: PARTIAL_ROOT + '/login.html',
      controller: 'LoginCtrl'
    });
    $routeProvider.when('/groups', {
      templateUrl: PARTIAL_ROOT + '/groups/index.html',
      controller: 'GroupCtrl'
    });
    $routeProvider.when('/groups/:id', {
      templateUrl: PARTIAL_ROOT + '/groups/show.html',
      controller: 'GroupDetailCtrl'
    });
    $routeProvider.when('/groups/:id/edit', {
      templateUrl: PARTIAL_ROOT + '/groups/edit.html',
      controller: 'GroupDetailCtrl'
    });
    $routeProvider.when('/devices', {
      templateUrl: PARTIAL_ROOT + '/devices/index.html',
      controller: 'DeviceCtrl'
    });
    $routeProvider.when('/devices/:id', {
      templateUrl: PARTIAL_ROOT + '/devices/show.html',
      controller: 'DeviceDetailCtrl'
    });
    $routeProvider.when('/devices/:id/edit', {
      templateUrl: PARTIAL_ROOT + '/devices/edit.html',
      controller: 'DeviceDetailCtrl'
    });
    $routeProvider.when('/users', {
      templateUrl: PARTIAL_ROOT + '/users/index.html',
      controller: 'UserCtrl'
    });
    $routeProvider.when('/rules', {
      templateUrl: PARTIAL_ROOT + '/rules/index.html',
      controller: 'RuleCtrl'
    });
    $routeProvider.when('/rules/:id', {
      templateUrl: PARTIAL_ROOT + '/rules/edit.html',
      controller: 'RuleDetailCtrl'
    });
    $routeProvider.when('/resources/:id', {
      templateUrl: PARTIAL_ROOT + '/resources/show.html',
      controller: 'ResourceDetailCtrl'
    });
    $routeProvider.when('/psks', {
      templateUrl: PARTIAL_ROOT + '/psks/index.html',
      controller: 'PSKCtrl'
    });
    $routeProvider.otherwise({
      redirectTo: '/'
    });
  }
]);
gobiApp.config(function($logProvider) {
  $logProvider.debugEnabled(true);
});

gobiApp.config(function($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our assets domain.  Notice the difference between * and **.
    'http://localhost:3001/**'
  ]);

});

gobiApp.factory('apiHttpInterceptor', function($q, $location, $log, localStorageService) {
  return {
    'request': function($config) {
      $config.headers['Session'] = localStorageService.get('session');
      $config.headers['Content-Type'] = 'application/json';
      return $config || $q.when(config);

    },
    'requestError': function(rejection) {
      $log.log('request error:');
      $log.log(rejection);
    },
    // 'responseError': function(rejection) {
    //   // switch to login screen on 401 unauthorized or connection refused
    //   if (rejection.status === 401) {
    //     // $location.path('/login');
    //   }
    //   return rejection;
    // }

  };
});

gobiApp.config(['$httpProvider',
  function($httpProvider) {
    $httpProvider.interceptors.push('apiHttpInterceptor');
  }
]);

gobiApp.run(function($rootScope, TemplateService) {
  $rootScope.value_to_readable = function(resource) {
    return TemplateService.getReadableValueFromResource(resource);
  };
  $rootScope.type_to_readable = function(resource) {
    return TemplateService.getReadableTypeFromResource(resource);
  };
  $rootScope.condition_to_readable = function(key, condition) {
    return TemplateService.getReadableFromCondition(key, condition);
  }
  $rootScope.action_to_readable = function(action) {
    return TemplateService.getReadableFromAction(action);
  }
});
