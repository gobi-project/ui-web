var gobiServices = angular.module('gobiServices', []);

function unique(data, key) {
  var result = [];
  for (var i = 0; i < data.length; i++) {
    var value = data[i][key];
    if (result.indexOf(value) == -1 && value.length > 0) {
      result.push(value);
    }
  }

  return result;
}

gobiServices.service('TemplateService', function(localStorageService) {
  this.roundValue = function(value) {
    return Math.round(value * 100) / 100;
  };

  this.getWidgetUrlFromResourceType = function(resourceType) {
    var PARTIAL_URL = 'partials/widgets/';

    resourceUrlMapping = {
      'gobi.s.tmp': PARTIAL_URL + 'temperature.html',
      'gobi.s.pow': PARTIAL_URL + 'power.html',
      'gobi.a.swt': PARTIAL_URL + 'switch.html',
      'gobi.a.light.swt' : PARTIAL_URL + 'switch.html',
      'gobi.s.hum': PARTIAL_URL + 'humidity.html',
      'gobi.s.lux': PARTIAL_URL + 'light.html',
      'gobi.a.light.rgb': PARTIAL_URL + 'rgb.html',
    };

    var result = resourceUrlMapping[resourceType];
    if (result) {
      return result;
    }

    return PARTIAL_URL + 'temperature.html';
  };

  this.getReadableValueFromResource = function(resource) {
    // TODO: Refactor

    if (resource.resource_type === 'gobi.s.tmp') {
      if (resource.unit === "%degF"){
          // from °F to °C
          return this.roundValue((5/9)*(resource.value-32)) + ' °C';
      }
      return this.roundValue(resource.value) + ' °C';
    } else if (resource.resource_type === 'gobi.s.lux') {
      return this.roundValue(resource.value) + ' Lux';
    } else if (resource.resource_type === 'gobi.s.pow') {
      return this.roundValue(resource.value) + ' W';
    } else if (resource.resource_type === 'gobi.a.swt') {
      if (resource.value > 0.1) {
        return 'An';
      }
      return 'Aus';
    } else if (resource.resource_type === 'gobi.s.hum') {
      return this.roundValue(resource.value) + ' %';
    }

    return this.roundValue(resource.value);
  };

  this.getReadableTypeFromResource = function(resource) {
    resourceTypeMapping = {
      'gobi.s.tmp': 'Temperatur (Sensor)',
      'gobi.s.pow': 'Leistung (Sensor)',
      'gobi.a.swt': 'Schalter (Aktor)',
      'gobi.s.hum': 'Luftfeuchtigkeit (Sensor)',
      'gobi.s.lux': 'Lichtintensität (Sensor)',
      'gobi.a.light.rgb': 'Lichtfarbe (Aktor)'
    };

    var result = "";

    if (resource && resource.resource_type) {
      result = resourceTypeMapping[resource.resource_type];
    } else {
      result = "Unbekannter Typ";
    }

    if (result === undefined) {
      result = resource.resource_type;
    }

    return result;
  };

  this.getReadableFromCondition = function(key, condition) {
    // GREATER | LESS | EQUAL | UNEQUAL | STATE
    // {"equal":[{"id":1,"value":10}
    var resource = localStorageService.get('resource_' + condition.resource_id);
    var resource_name = resource.name;
    if (resource_name === null) {
      resource_name = condition.resource_id;
    }

    var conditionTypeMapping = {
      'greater': 'größer als',
      'less': 'kleiner als',
      'equal': 'gleich',
      'unequal': 'ungleich',
    };

    return this.getReadableTypeFromResource({
      resource_type: resource.resource_type
    }) + " " + resource_name + " " + conditionTypeMapping[key] + " " + this.getReadableValueFromResource({
      resource_type: resource.resource_type,
      value: condition.value
    });
  };

  this.getReadableFromAction = function(action) {
    var actor = localStorageService.get('resource_' + action.resource_id);
    var actor_name = actor.name;
    if (actor_name === null) {
      actor_name = action.resource_id;
    }
    return this.getReadableTypeFromResource({
      resource_type: actor.resource_type
    }) + " " + actor_name + ' => ' + this.getReadableValueFromResource({
      resource_type: actor.resource_type,
      value: action.value
    });
  };

});

gobiServices.factory('RestService',
  function(Restangular, localStorageService, $log) {
    base_url = 'http://' + localStorageService.get('api_server');
    base_url = base_url + ':' + localStorageService.get('api_port') + '/api/v1';
    $log.log('RestService auf ' + base_url);
    Restangular.setBaseUrl(base_url);
    return Restangular;
  }
);
