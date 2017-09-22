// The maps object
angular.module('mapAppParent', [
  'ProudBase',
  'ProudMaps'
])

.config(
  [ '$stateProvider', '$urlRouterProvider', 'MapsProvider', 'MapsRoutesProvider',
    function ($stateProvider, $urlRouterProvider, MapsProvider, MapsRoutesProvider) {  
      var id = MapsProvider.getMapId();
      $stateProvider.state("maps", {
        template: '<div class="fadeonly" ui-view></div>',
        data: { 
          doScroll: false,  // No scroll on route change
          undoMainToggle: false,   // Force "offcanvas" class off
          title: 'View map'
        },
        resolve: {
          layers: function($rootScope, $q, $http, Post) {
            // re-init the map, pass all the required objects
            MapsProvider.init({}, $rootScope, $q, $http, Post);
            return MapsProvider.getLayers();
          },
        },
        url: "/maps-" + id,
        controller: function($scope, $rootScope, $state, layers){
          $scope.layerLoading = false;
          $scope.layers = layers;
          $scope.currentLayer = null;

          // Init listeners
          $rootScope.setWatchers($scope, {
            // Listen for loading
            'maps-layer-loading': function(event, loading) {
              $scope.layerLoading = loading;
            },

            // Layer done
            'maps-layer-change': function(event, args) {
              $scope.currentLayer = args.layer;
            }
          });
        }
      });
      // Attach our maps sub-routing
      MapsRoutesProvider.attachRoutes('maps', $stateProvider, MapsProvider);    
    }
  ]
)

// Isotope social wall
.directive('mapParent', function($rootScope, $state, Maps, $location) {
  return {
    restrict: 'A',
    template: '<div class="fadeonly" ui-view></div>',
    link: function() {
       // Initial page load / or no path ? Redirect if applicable
      if(!$state.current || !$state.current.name) {
        var mapId = Maps.getMapId();
        // Basically we want to goto state (silently) if there
        // 1. is none
        // 2. only has 1 path element (since everything is at least maps/map)
        // 3. none of the routes are matched
        var paths = $location.$$path.length > 1 ? $location.$$path.substring(1).split('/').filter(function(n){ return n; }) : [];
        var shouldRedirect = !paths.length || paths.length < 2 || !_.filter($state.get(), function(state) {
            return state.url && state.url.substring(1) === paths[0];
        }).length;
        if(shouldRedirect) {
          $state.go('maps.mapview', {}, {location: false});
        }
      }
    }
  }
});

(function($, Proud) {
  Proud.behaviors.proud_map_app = {
    attach: function(context, settings) {
      var instances = _.get(settings, 'proud_map_app.instances');
      // initialize instances
      if (instances) {
        $.each(instances, function(id, appVals) {
          // Deal with converting old settings
          appVals['include_map_filters'] = true;
          if( appVals['source'] === 'foursquare' ) {
            appVals['source'] = 'google';
          }
          // Value could be false or 0
          if( appVals['map_has_overlay'] !== false && appVals['map_has_overlay'] != 0 ) {
            appVals['map_has_overlay'] = true;
            appVals['map_style_display'] = 'fullscreen';
          } else {
            appVals['map_has_overlay'] = false;
            appVals['map_style_display'] = 'normal';
          }
          // Set values
          _.set(Proud, 'settings.proud_map_app.instances.' + id, appVals);
          var $app = $('#' + id);
          if(!$app.hasClass('ng-scope')) {
            angular.bootstrap($app, ['mapAppParent']);
          }
        });
      }
    }
  }
})(jQuery, Proud);