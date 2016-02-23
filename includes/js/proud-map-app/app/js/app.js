'use strict';

//***************************************

// Main Application

//***************************************

angular.module('mapAppParent', [
  'mapApp',
  'angular-inview',
  'angular-lazycompile'
])

.run(
  [          '$rootScope', '$window', '$location', 
    function ($rootScope,   $window,   $location) {
      $rootScope.mapboxAccessToken = 'pk.eyJ1IjoiYWxiYXRyb3NzZGlnaXRhbCIsImEiOiI1cVUxbUxVIn0.SqKOVeohLfY0vfShalVDUw';
      $rootScope.mapboxMap = 'albatrossdigital.lpkdpcjb';

      $rootScope.proudcityApi='http://my.getproudcity.com/api/proudcity/';
      $rootScope.proxyUrl = $rootScope.proudcityApi + 'proxy';
      $rootScope.paymentUrl = $rootScope.proudcityApi + 'invoice-example';
		}
	]
)

.controller('MapControl', ['$scope', '$rootScope', '$filter', '$http',
                   function($scope,   $rootScope,   $filter,   $http){

    Proud = Proud || {}; 

    var $state = {
      params: {
        city: _.get(Proud, 'settings.global.location.city') || 'seattle',
        state: _.get(Proud, 'settings.global.location.state') || 'washington'
      }
    }

    var ucWords = function(str) {
      return (str + '')
        .replace('\-', ' ')
        .replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function($1) {
          return $1.toUpperCase();
        });
    }

    $scope.location = {
      state: ucWords($state.params.state),
      city: ucWords($state.params.city),
      key: {
        state: $state.params.state,
        city: $state.params.city
      }
    }
    console.log(Proud);

    $rootScope.appId = $rootScope.appId != undefined ? $rootScope.appId : 'proud_map_app-1391006';

    $scope.settings = {
      lat: _.get(Proud, 'settings.global.location.lat') || '',
      lng: _.get(Proud, 'settings.global.location.lng') || '',
      city: _.get(Proud, 'settings.global.location.city') || '',
      state: _.get(Proud, 'settings.global.location.state') || '',
      wordpress: {
        apiUrl: _.get(Proud, 'settings.proud_map_app.global.api_path') || ''
      },
      foursquare: {
        clientKey: '1CAZ5UW5UDQ2F1EDEHFOULURU4K3RBWWITBOONJ2XLXPD52V',
        clientSecret: 'GA4DAN4KLI5UM0VJ4BAZAE4SEVLIR0BC5B4UKGNVR2VJXXWN',
        apiUrl: 'https://api.foursquare.com/'
      }
    };


    console.log($rootScope.appId);

/*
    //$http.get($rootScope.proudcityApi +'?state='+ $state.params.state +'&city='+ $state.params.city).success(function(data){
      // Proud options
      var data = {};
      data.lat = _.get(Proud, 'settings.global.location.lat') || data.lat;
      data.lng = _.get(Proud, 'settings.global.location.lng') || data.lng;

      $scope.location = {
        city: _.get(Proud, 'settings.global.location.city') || data.lat,
        state: _.get(Proud, 'settings.global.location.state') || data.state
      };

      $scope.settings = _.merge(data, $scope.settings);
      console.log($scope.settings);
    //});
*/
  }
])

// Isotope social wall
.directive('mapParent', function factory() {
  return {
    restrict: 'A',
    controller: "MapControl",
    template: '<div proud-map="settings" />'
  }
})