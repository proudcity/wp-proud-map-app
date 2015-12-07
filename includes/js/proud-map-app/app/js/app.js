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

    var drupal = typeof Drupal !== 'undefined' ? Drupal : {}; 

    var $state = {
      params: {
        city: _.get(drupal, 'settings.proud_map_app.city') || 'seattle',
        state: _.get(drupal, 'settings.proud_map_app.state') || 'washington'
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


    $scope.settings = {
      color: {
        main: '#000',
        secondary: '#000',
        highlight: '#2196F3'
      },
      header: {
        backgroundType: 'image',
        backgroundImage: '',
        backgroundColor: '',
        searchColor: '#FFFFFF',
        searchAlign: 'left'
      }
    }

    $http.get($rootScope.proudcityApi +'?state='+ $state.params.state +'&city='+ $state.params.city).success(function(data){
      // Drupal options
      data.lat = _.get(drupal, 'settings.proud_map_app.lat') || data.lat;
      data.lng = _.get(drupal, 'settings.proud_map_app.lng') || data.lng;

      $scope.location = {
        city: data.city,
        county: data.county,
        state: data.state
      };

      $scope.settings = _.merge(data, $scope.settings);
    });

  }
])

// Isotope social wall
.directive('mapParent', function factory() {
  return {
    restrict: 'A',
    controller: "MapControl",
    template: '<div foursquare-map="settings" />'
  }
})