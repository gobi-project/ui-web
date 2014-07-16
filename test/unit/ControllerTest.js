describe('GroupCtrl Test', function() {
  var $injector;
  var $httpBackend;
  const BASE_URL = 'http://leet_server:1337/api/v1';

  beforeEach(function() {
    $injector = angular.injector(['ngMock', 'ng', 'GobiSmartHome']);
    restService = $injector.get('RestService');
    restService.setBaseUrl(BASE_URL);

    $httpBackend = $injector.get('$httpBackend');
    $httpBackend
      .when('GET', BASE_URL + '/groups')
      .respond(
        [{
          "id": 1337,
          "name": "group_1",
          "resources": [{
            "id": 42,
            "device_id": 1337,
            "name": "res_1",
            "resource_type": "RESOURCETYPE",
            "interface_type": "INTERFACETYPE",
            "unit": "UNIT",
            "value": 1337
          }],
          "rules": []
        }]
    );

    $rootScope = $injector.get('$rootScope');
    $scope = $rootScope.$new();

    var $controller = $injector.get('$controller');

    createGroupController = function() {
      return $controller('GroupCtrl', {
        '$scope': $scope
      });
    };
  });

  it('GroupCtrl lädt Gruppen', function() {
    var groupCtrl = createGroupController();
    $httpBackend.flush();
    expect($scope.groups.length).toEqual(1);
    expect($scope.groups[0].name).toEqual('group_1');
    expect($scope.groups[0].resources.length).toEqual(1);
    expect($scope.groups[0].rules.length).toEqual(0);
  });

});