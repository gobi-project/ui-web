var gobiControllers = angular.module('gobiControllers', []);
var INTERVAL_TIME_MS = 10000;

gobiControllers.controller('OverviewCtrl',
  function($scope, $interval, TemplateService, RestService, localStorageService) {
    $scope.is_loading = true;

    $scope.refresh = function(){
        RestService.all('resources').getList().then(function(resources) {
          $scope.resources = resources;
          var resource_types = unique($scope.resources, 'resource_type');
          for (var i = 0; i < $scope.resources.length; i++) {
            localStorageService.add("resource_" + $scope.resources[i].id, $scope.resources[i]);
          }
          $scope.resource_types = resource_types;
          $scope.is_loading = false;
        },
        function(){
          $scope.connection_error = true;
        }
    );
    };

    $scope.refresh();
    //interval = $interval($scope.refresh, INTERVAL_TIME_MS);

    $scope.getWidgetUrl = function(resource) {
      return TemplateService.getWidgetUrlFromResourceType(resource.resource_type);
    };

    $scope.$on('$destroy', function() {
      $interval.cancel(interval);
    });
  }
);

gobiControllers.controller('WidgetCtrl',
  function($scope, $log, RestService) {
    $scope.set_resource_value = function(value) {
      RestService.one('resources', $scope.resource.id).patch({
        "value": value
      });
    };

    $scope.boolean_value = function() {
      return $scope.resource.value > 0;
    };

    $scope.toggle_value = function() {
      if ($scope.resource.value > 0.1) {
        $scope.resource.value = 0;
      } else {
        $scope.resource.value = 1;
      }

      $scope.set_resource_value($scope.resource.value);
    };

    if ($scope.resource.value){
      $scope.color_value = '#' + $scope.resource.value.toString(16);
    }

    $scope.setCharAt = function(str,index,chr) {
        if(index > str.length-1) return str;
        return str.substr(0,index) + chr + str.substr(index+1);
    };

    $scope.set_resource_rgb_value = function(){
      var color_value = $scope.color_value;
      $log.log("RGB setzen... " + color_value);
      color_value = parseInt(color_value.substr(1,6), 16);
      $log.log("Konvertierter Wert... " + color_value);

      $scope.set_resource_value(color_value);
    };
  }
);

gobiControllers.controller('LoginCtrl',
  function($scope, $http, $log, $location, RestService, localStorageService) {
    var server = localStorageService.get('api_server');
    var port = localStorageService.get('api_port');

    if (!server) {
      server = 'localhost';
      port = '3001';
    }

    $scope.api_server = server;
    $scope.api_port = port;

    $scope.connection_error = false;
    $scope.login_error = false;

    $scope.login = function() {
      $log.log("Starte Login....");

      localStorageService.add('api_server', $scope.api_server);
      localStorageService.add('api_port', $scope.api_port);
      localStorageService.add('current_user', $scope.username);
      RestService.setBaseUrl('http://' + $scope.api_server + ':' + $scope.api_port + '/api/v1');

      RestService.all('login').post({
        "username": $scope.username,
        "password": $scope.password,
      }).then(function(data) {
        localStorageService.add('session', data.session);
        $location.path("/");
      }, function(response) {
        $location.path("/login");
        $log.log('Login error!');
        if (response.status == 401) {
          $scope.login_error = true;
        } else {
          $scope.connection_error = true;
        }

      });
    };

    $scope.toggle_connection_options = function() {
      $('#collapseOne').collapse('toggle');
    };

    $scope.logout = function() {
      $log.log("Logout....");
      $location.path("/login");

      RestService.all('login').remove().then(function() {
        localStorageService.add('session', '');
        $log.log("Redirect zu login...");      });
    };
  }
);

gobiControllers.controller('PSKCtrl',
  function($scope, $log, RestService) {

    $scope.save_psk = function(){
      $log.log('save psk...');
      RestService.all('psk').post({
        "uuid": $scope.uuid,
        "psk": $scope.psk,
        "desc": $scope.desc
      });

      $scope.uuid = '';
      $scope.psk = '';
      $scope.desc = '';
    };

    $scope.uuid_valid = function() {
      $log.log('save psk...');
      if ($scope.uuid) {
        return $scope.uuid.length == 36;
      }
      return true;
    };

    $scope.psk_valid = function() {
      if ($scope.psk) {
        return $scope.psk.length == 16;
      }
      return true;
    };

  }
);

gobiControllers.controller('GroupCtrl',
  function($scope, RestService) {
    $scope.is_loading = true;
    $scope.connection_error = false;
    $scope.groups = [];

    $scope.refresh = function() {
      RestService.all('groups').getList().then(
        function(groups) {
          $scope.groups = groups;
          $scope.is_loading = false;
        },
        function(error) {
          $scope.connection_error = true;
          $scope.is_loading = false;
        });
    };

    $scope.refresh();

    $scope.group_list_empty = function() {
      return $scope.groups.length === 0 && !$scope.is_loading;
    };

    $scope.add_group = function() {
      var newGroup = {
        name: $scope.new_group_name
      };
      $scope.groups.post(newGroup).then(function() {
        $scope.groups = RestService.all('groups').getList().$object;
      });

    };

  }
);

gobiControllers.controller('GroupDetailCtrl',
  function($scope, $routeParams, $location, RestService, TemplateService, $log) {
    $scope.group = RestService.one('groups', $routeParams.id).get().$object;
    $scope.resources = RestService.all('resources').getList().$object;
    $scope.devices = RestService.all('devices').getList().$object;

    $scope.remove_resource = function(index) {
      $scope.group.resources.splice(index, 1);
    };

    $scope.add_resources = function(resources) {
      //$scope
    };

    $scope.delete_group = function() {
      $scope.group.remove().then(function() {
        $location.path("/groups");
      });
    };

    $scope.save_group = function() {
      $scope.group.patch({
        "name": $scope.group.name
      }).then(function() {
        $location.path("/groups");
      });
    };

    $scope.getChartUrl = function(resource) {
      return 'partials/charts/line-chart.html';
    };

    $scope.getWidgetUrl = function(resource) {
      return TemplateService.getWidgetUrlFromResourceType(resource.resource_type);
    };
  }
);

gobiControllers.controller('DeviceCtrl',
  function($scope, RestService) {

    $scope.devices =[];

    $scope.refresh = function() {
      RestService.all('devices').getList().then(
        function(devices) {
          $scope.devices = devices;
          $scope.is_loading = false;
        },
        function(error) {
          $scope.connection_error = true;
          $scope.is_loading = false;
        });
    };

    $scope.refresh();

    $scope.device_list_empty = function() {
      return $scope.devices.length === 0;
    };
  }
);

gobiControllers.controller('DeviceDetailCtrl',
  function($scope, $routeParams, $location, RestService, TemplateService) {
    $scope.device = RestService.one('devices', $routeParams.id).get().$object;

    $scope.rescan = function() {
      $scope.device.patch({
        status: "rescan"
      });
    };

    $scope.delete_device = function() {
      $scope.device.remove();
      $location.path("/devices");
    };

    $scope.save_device = function() {
      $scope.device.patch({
        "name": $scope.device.name
      });
      $location.path("/devices");
    };

    $scope.getChartUrl = function(resource) {
      return 'partials/charts/line-chart.html';
    };

    $scope.getWidgetUrl = function(resource) {
      return TemplateService.getWidgetUrlFromResourceType(resource.resource_type);
    };

  }
);

gobiControllers.controller('UserCtrl',
  function($scope, RestService) {
    $scope.users = RestService.all('users').getList().$object;
    $scope.new_user_name = "";
    $scope.new_user_password = "";
    $scope.new_user_email = "";

    $scope.add_user = function() {
      var newUser = {
        username: $scope.new_user_name,
        password: $scope.new_user_password,
        email: $scope.new_user_email
      };
      $scope.users.post(newUser).then(function() {
        $scope.users = RestService.all('users').getList().$object;
      });

    };

    $scope.delete_user = function(userId) {
      RestService.one('users', userId).remove().then(function() {
        $scope.users = RestService.all('users').getList().$object;
      });
    };
  }
);

gobiControllers.controller('ChartCtrl',
  function($scope, $log, $interval, TemplateService, RestService) {

    $scope.timespace = 'one_day';

    $scope.updateMeasurements = function(fromDate, toDate) {
      var measurements = RestService.one("devices", $scope.resource.device_id).one("resources", $scope.resource.id).one("measurements").get({
        from: fromDate,
        to: toDate,
        granularity: 5
      }).then(function(measurements) {
        $scope.measurements = measurements;
        var newChartData = [{
          "key": "Messdaten",
          "color": '#FFC900',
          "values": [],
        }];
        for (var i = 0; i < $scope.measurements.length; i++) {
          var new_entry = [$scope.measurements[i].datetime, $scope.measurements[i].value];
          newChartData[0].values.push(new_entry);
        }
        $scope.chartData = newChartData;
      });
      // ...
    };

    $scope.xAxisTickFormatFunction = function() {
      return function(d) {
        return d3.time.format('%d.%m - %H:%M')(moment.unix(d).toDate());
      };
    };

    $scope.yAxisTickFormatFunction = function() {
      return function(d) {
        return d3.format(',.2f')(d);
      };
    };

    $scope.getChart = function(timespace) {
      $log.log($scope.timespace);
      if (timespace){
        $scope.timespace = timespace;
      }

      timestamp_offset = {
        //projekttag entries
        '5_minutes': (5 * 60),
        '10_minutes': (10 * 60),
        '30_minutes': (30 * 60),
        'one_hour': (3600),
        'five_hour': (5 * 3600),
        'one_day': (24 * 3600),
        'one_week': (7 * 24 * 3600),
        'one_month': (31 * 24 * 3600),
        'one_year': (365 * 24 * 3600),
        'five_years': (5 * 365 * 24 * 3600),
      };

      var endTimestamp = Math.floor(Date.now() / 1000);
      var startTimestamp = endTimestamp - timestamp_offset[$scope.timespace];

      $scope.updateMeasurements(startTimestamp, endTimestamp);
    };

    $scope.refreshChart = function(){
      $scope.getChart();
    };

    interval = $interval($scope.refreshChart, 3000);

    $scope.$on('$destroy', function() {
      $interval.cancel(interval);
    });

  });

gobiControllers.controller('ResourceDetailCtrl',
  function($scope, $routeParams, $log, $interval, TemplateService, RestService) {

    $scope.refresh = function(){
      RestService.one('resources', $routeParams.id).get().then(
        function(resource){
          $scope.resource = resource;
        }
      );
    };
    $scope.resource = RestService.one('resources', $routeParams.id).get().$object;
    interval = $interval($scope.refresh, INTERVAL_TIME_MS);


    $scope.widget_url = TemplateService.getWidgetUrlFromResourceType($scope.resource.resource_type);
    $scope.chart_url = "partials/charts/line-chart.html";
    $scope.info_url = "partials/widgets/info.html";

    $scope.chartData = [];
    $scope.timespace = 'one_day';

    $scope.to_readable = function(resource) {
      return TemplateService.getReadableValueFromResource(resource);
    };

    $scope.$on('$destroy', function() {
      $interval.cancel(interval);
    });

  }
);

gobiControllers.controller('RuleCtrl',
  function($scope, RestService) {
    $scope.rules = [];

    RestService.all('rules').getList().then(
      function(rules){
        $scope.rules = rules;
      },
      function(){
        $scope.connection_error = true;
      }
    );
    $scope.rules_list_empty = function() {
      return $scope.rules.length === 0;
    };
    //show not error for projekttag presentation
    $scope.demo_error = false;

    $scope.show_demo_error = function(){
      $scope.demo_error = true;
    };
  }
);

gobiControllers.controller('RuleDetailCtrl',
  function($scope, $routeParams, RestService) {
    $scope.rule = RestService.one('rules', $routeParams.id).get().$object;
    $scope.resources = RestService.one('resources').getList().$object;
  }
);

gobiControllers.controller('HeaderCtrl',
  function($scope, $location, localStorageService) {
    $scope.current_user = localStorageService.get('current_user');

    $scope.isActive = function(viewLocation) {
      return viewLocation === $location.path();
    };

    $scope.logged_in = function() {
      return ($location.path() != '/login');
    };
  }
);

gobiControllers.controller('PSKCtrl',
  function($scope, RestService) {
    $scope.psks = RestService.all('psk').getList().$object;

    $scope.delete_psk = function(pskId) {
      RestService.one('psk', pskId).remove().then(function() {
        $scope.psks = RestService.all('psk').getList().$object;
      });

    };
  }

);
