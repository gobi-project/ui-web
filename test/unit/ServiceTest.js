describe('SessionService Test', function() {
  var $injector;
  var $httpBackend;
  var sessionService;
  const SESSION_TOKEN = 'session_token_1337';

  beforeEach(function() {
    $injector = angular.injector(['ngMock', 'ng', 'GobiSmartHome']);
    restService = $injector.get('RestService');
    restService.setBaseUrl('http://leet_server:1337/api/v1');

    $httpBackend = $injector.get('$httpBackend');

    sessionService = $injector.get('SessionService');

    $httpBackend
      .when('POST', 'http://leet_server:1337/api/v1/login')
      .respond({
        session: SESSION_TOKEN
      });
    $httpBackend
      .when('DELETE', 'http://leet_server:1337/api/v1/login')
      .respond({});
  });

  it('Token via /login anfordern', function() {
    sessionService.requireNewToken('user', 'password');
    $httpBackend.flush();
    expect(sessionService.getToken()).toEqual(SESSION_TOKEN);
  });

  it('Token löschen', function() {
    sessionService.destroySession();
    $httpBackend.flush();
    expect(sessionService.getToken()).toEqual(null);
  });
});


describe('TemplateService Test', function() {
  var $injector;
  var templateService;
  var tmp_resource, switch_resource;

  beforeEach(function() {
    $injector = angular.injector(['ngMock', 'ng', 'GobiSmartHome']);
    templateService = $injector.get('TemplateService');

    tmp_resource = {
      resource_type: 'gobi.s.tmp',
      value: 1337
    };

    switch_resource = {
      resource_type: 'gobi.a.swt',
      value: 0
    };
  });

  it('Lesbaren Wert von resource.value zurückgeben', function() {
    var read_value = templateService.getReadableValueFromResource(tmp_resource);
    expect(read_value).toEqual('1337 °C');

    read_value = templateService.getReadableValueFromResource(switch_resource);
    expect(read_value).toEqual('Aus');
  });

  it('Lesbaren Wert von resource.value runden', function() {
    tmp_resource.value = 13.3333333337;

    var read_value = templateService.getReadableValueFromResource(tmp_resource);
    expect(read_value).toEqual('13.33 °C');
  });

  it('Lesbaren Resouren-Typ von resource.resource_type zurückgeben', function() {
    var read_value = templateService.getReadableTypeFromResource(tmp_resource);
    expect(read_value).toEqual('Temperatur (Sensor)');

    read_value = templateService.getReadableTypeFromResource(switch_resource);
    expect(read_value).toEqual('Schalter (Aktor)');

    read_value = templateService.getReadableTypeFromResource(null);
    expect(read_value).toEqual('Unbekannter Typ');
  });

  //
  it('WidgetUrl auch bei null-resource-type zurückgeben', function() {
    var read_value = templateService.getWidgetUrlFromResourceType(null);
    expect(read_value.length > 0).toBe(true);
  });
});