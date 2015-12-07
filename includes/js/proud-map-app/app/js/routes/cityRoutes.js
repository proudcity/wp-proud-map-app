'use strict';

angular.module('mapAppParent')


.config(
  [ '$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {

      $urlRouterProvider.otherwise('/city');

      .state("city", {
        url: '/get/:state/:city',
        data: { 
          doScroll: true  // Scrolls on route change
        },
        templateUrl: 'views/directives/map.html',
        controller: function($scope, $rootScope, $state, $filter, $http){

          $state.params.city = 'new york';
          $state.params.state = 'ny';

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
            $scope.location = {
              city: data.city,
              county: data.county,
              state: data.state
            };
            $scope.settings = _.merge(data, $scope.settings);
            //angular.extend($scope.settings, data);
          });

        })
      })
    }
  ]
)