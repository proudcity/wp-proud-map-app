'use strict';

angular.module('mapApp', [
  'ngSanitize',
  'ngResource'
])

.run(
  [          '$rootScope', '$window', '$location', 
    function ($rootScope,   $window,   $location) {
    }
  ]
)

// .run(
//   [          '$rootScope', '$state', '$stateParams', '$window', '$location', 
//     function ($rootScope,   $state,   $stateParams,   $window,   $location) {
//       // Handle back when map is in full screen
//       $rootScope.fullScreen = false;
//       $rootScope.$on('$stateChangeStart', 
//         function(event, toState, toParams, fromState, fromParams){
//           // If the fullScreen map is enabled,
//           // don't navigate, end fullscreen
//           if($rootScope.fullScreen) {
//             event.preventDefault();
//             $rootScope.$broadcast('fullscreenClose', {});
//           }
//         }
//       );
//     }
//   ]
// )


.directive('foursquareMap', function factory($window, $browser, $http, $rootScope) {
  return {
    restrict: 'A',
    templateUrl: 'views/apps/mapApp/map.html',
    replace: false,
    scope: {
      foursquareMap: '='
    },
    link: function($scope, $element, $attrs) {
      $scope.details = {};

      var $mapWrap = $('#map-wrapper');

      // Set up full screen action
      $scope.toggleFullScreen = function(e) {
        if(e) {
          e.preventDefault();
          e.stopPropagation();
        }
        $rootScope.fullScreen = !$rootScope.fullScreen;
        $mapWrap.toggleClass('fullscreen');
      }
      // Expand map if closed
      $mapWrap.click(function(e) {
        if(!$rootScope.fullScreen) {
          $scope.toggleFullScreen(e);
          window.map.invalidateSize();
        }
      });
      // Listen for back button
      $rootScope.$on('fullscreenClose', function(args) {
        $scope.toggleFullScreen();
      });

      // Slide filters for mobile
      $scope.toggleFilter = function() {
        $mapWrap.toggleClass('filter-open');
        return false;
      }

      // Make details close link
      $('#details-close').click(function() {
        $mapWrap.removeClass("details-open");
        return false;
      });

      $scope.$watch('foursquareMap', function(settings){

        if (_.has(settings, 'lat')) {
          var config = {
            clientKey: '1CAZ5UW5UDQ2F1EDEHFOULURU4K3RBWWITBOONJ2XLXPD52V',
            clientSecret: 'GA4DAN4KLI5UM0VJ4BAZAE4SEVLIR0BC5B4UKGNVR2VJXXWN',
            authUrl: 'https://foursquare.com/',
            apiUrl: 'https://api.foursquare.com/',
            lat: settings.lat,
            lng: settings.lng
          };

          // @todo: get from $rootSCope
          L.mapbox.accessToken = 'pk.eyJ1IjoiYWxiYXRyb3NzZGlnaXRhbCIsImEiOiI1cVUxbUxVIn0.SqKOVeohLfY0vfShalVDUw';

          var map = new L.mapbox.Map('map', 'albatrossdigital.lpkdpcjb', {
              center: new L.LatLng(config.lat, config.lng),
              zoom: 15,
              scrollWheelZoom: false,
              zoomControl: false
          });
          new L.Control.Zoom({ position: 'topright' }).addTo(map);
          window.map = map;


          var attr;
          //var activeLayer;
          var gridControl;

          //if (settings.helm_civic_map.type == 'full') {  // @todo
            var layersInit = false, // 
                layers = document.getElementById('menu-ui'),
                mapLayers = {};

            var foursquareDefault = true;
            if (config.lat == 44.5667) {
              addLayer('Public Transit', 'mbtiles', 14, {url: settings.helm_civic_map.transportation, 'attribution': '<a href="ftp://ftp.ci.corvallis.or.us/pw/Transportation/GoogleTransitFeed/">City of Corvallis GTFS</a>'}, true);
              foursquareDefault = false;
            }


            //for (var i=0; i<params.query.length; i++) {
            //  addFoursquareLayer(params.query[i]);
            //}

            foursquareDefault = true;
            addLayer('All Services', 'foursquare', 13, {query: ['government','school','police station','fire station','library','post office','park']}, foursquareDefault); 
            addLayer('Schools', 'foursquare', 13, {query: 'school'}); 
            addLayer('Police', 'foursquare', 12, {query: 'police station'});
            addLayer('Fire', 'foursquare', 12, {query: 'fire station'}); 
            addLayer('Libraries', 'foursquare', 13, {query: 'library'}); 
            addLayer('Post Offices', 'foursquare', 13, {query: 'post office'}); 
            addLayer('Parks', 'foursquare', 14, {query: 'park'});
            addLayer('Reported Issues', 'seeclickfix', 14, {query: 'seeclickfix'});
            layersInit = true;

            //addLayer('Restaurants', 'foursquare', 15, {query: 'restaurant'});
            //addLayer('Entertainment', 'foursquare', 14, {query: 'entertainment'});
            //addLayer('Flu Shots', 'foursquare', 13, {query: 'flu'}, foursquareDefault);
            //addLayer('Events', 'drupal', 14, {url: settings.helm_civic_map.drupal_events});
          //}
          // @todo: http://www.opencyclemap.org/
          // @todo: hiking map

          
          function addLayer(name, type, zoom, params, active) {
              active = active == undefined ? false : active;
              //layer
              //  .setZIndex(zIndex)
              //  .addTo(map);

              // Create a simple layer switcher that
              // toggles layers on and off.
              var link = document.createElement('a');
                  link.href = '#';
                  link.className = active ? 'active' : '';
                  link.innerHTML = name;

              link.onclick = function(e) {
                  e.preventDefault();
                  e.stopPropagation();

                  for (var key in mapLayers) {
                    map.removeLayer(mapLayers[key]);
                  }

                  //window.activeLayer = L.layerGroup().addTo(map);
                  if (attr != undefined) {
                    //map.removeControl(attr);
                  }
                  if (gridControl != undefined) {
                    map.removeControl(gridControl);
                    gridControl = undefined;
                  }
                  //attr = L.control.attribution({prefix: false}).addTo('map');
                  map.setView(new L.LatLng(config.lat, config.lng), zoom, {animate: true});
                  $('#menu-ui a.active').removeClass('active');
                  map.invalidateSize();
                  this.className = 'active';

                  switch(type) {
                    case 'foursquare':
                      if (Array.isArray(params.query)) {
                        for (var i=0; i<params.query.length; i++) {
                          addFoursquareLayer(params.query[i], 'small');
                        }
                      }
                      else {
                        addFoursquareLayer(params.query, 'large');
                      }
                      //attr.addAttribution('<a href="http://foursquare.com">Foursquare</a>');
                      map.attributionControl.setPrefix('Data from <a href="http://foursquare.com">Foursquare</a>');
                      break;
                    case 'seeclickfix':
                      addSeeClickFixLayer('closed');
                      addSeeClickFixLayer('open');
                      addSeeClickFixLayer('acknowledged');
                      map.attributionControl.setPrefix('Data from <a href="http://seeclickfix.com">SeeClickFix</a>');
                      break;
                    case 'drupal':
                      addFoursquareLayer(params.query);
                      map.attributionControl.setPrefix('Data from <a href="/">this website</a>');
                      //attr.addAttribution('This website');
                      break;
                    case 'mbtiles':
                      tile = L.mapbox.tileLayer(params.url).addTo(window.activeLayer);
                      grid = L.mapbox.gridLayer(params.url).addTo(window.activeLayer);
                      gridControl = L.mapbox.gridControl(grid, {follow: true}).addTo(map);

                      //attr.addAttribution(params.attribution);
                  }

                  // If actual click, then toggle filters
                  if(layersInit) {
                    $scope.toggleFilter();
                  }
            
              };
              if (active) {
                $(link).trigger('click');
              }


              layers.appendChild(link);
          }

          function addFoursquareLayer(query, size) {
            /* Query Foursquare API for venue recommendations near the current location. */
            //if (mapLayers[query] != undefined) {
            //  console.log(mapLayers[query]);
            //  mapLayers[query].addTo(map);
            //}
            //else {

              var url = config.apiUrl + 'v2/venues/explore?ll=' + config.lat + ',' + config.lng + '&query=' + query + '&client_id=' + config.clientKey + '&client_secret=' + config.clientSecret +'&v=20140601';
              $.getJSON(url, {}, function(data) {
                var venues = data['response']['groups'][0]['items'];
                
                var layer = L.mapbox.featureLayer();

                var geojson = {
                  type: 'FeatureCollection',
                  features: []
                };

                /* Place marker for each venue. */
                for (var i = 0; i < venues.length; i++) {
                  var category = venues[i]['venue']['categories'][0]['name'];
                  var color = '#997C61';
                  var icon = 'star';
                  if (category.indexOf('Library') !=-1) {
                    icon = 'library';
                    color = '#A973A9';
                  }
                  else if (category.indexOf('School') !=-1 || category.indexOf('College') !=-1 || category.indexOf('University') !=-1) {
                    icon = 'college';
                    color = '#ED9356';
                  }
                  else if (category.indexOf('Police') !=-1) {
                    icon = 'police';
                    color = '#456D9C';
                  }
                  else if (category.indexOf('Fire') !=-1) {
                    icon = 'fire-station';
                    color = '#E76C6D';
                  }
                  else if (category.indexOf('Post') !=-1) {
                    icon = 'post';
                    color = '#5A97C4';
                  }
                  else if (query == 'park' || category.indexOf('Park') !=-1) {
                    icon = 'park2';
                    color = '#9BBF6A';
                  }
                  geojson.features.push({
                    type: 'Feature',
                    properties: {
                      title: venues[i]['venue']['name'],
                      'marker-color': color,
                      'marker-size': size,
                      'marker-symbol': icon,
                      'url': venues[i]['venue']['url'] != undefined ? venues[i]['venue']['url'] : undefined,
                      'details': venues[i]['venue']
                    },
                    geometry: {
                      type: 'Point',
                      coordinates: [venues[i]['venue']['location']['lng'], venues[i]['venue']['location']['lat']]
                    }
                  })

                  /* Build icon for each icon */
                  /*var fsqIcon = venues[i]['venue']['categories'][0]['icon'];
                  var leafletIcon = L.Icon.extend({
                    options: {
                      iconUrl: fsqIcon['prefix'] + '32' + fsqIcon['suffix'],
                      shadowUrl: null,
                      iconSize: new L.Point(32,32),
                      iconAnchor: new L.Point(16, 41),
                      popupAnchor: new L.Point(0, -51)
                    }
                  });
                  var icon = new leafletIcon();
                  var popup = '<h4>' + venues[i]['venue']['name'] + '</h4>' + venues[i]['venue']['categories'][0].name;
                  if (venues[i]['venue']['contact'].formattedPhone != undefined) {
                    popup += '<br/>' + venues[i]['venue']['contact'].formattedPhone;
                  }
                  
                  var marker = new L.Marker(latLng, {icon: icon})
                    .bindPopup(popup, { closeButton: false })
                    .on('mouseover', function(e) { this.openPopup(); })
                    .on('mouseout', function(e) { this.closePopup(); })
                    .on('click', function(e) {
                      console.log(venues);
                      console.log(e);
                      console.log(venues[i]['venue']);
                      if (venues[i]['venue']['url'] != undefined) {
                        window.open(url,'_blank');
                      }
                    });
                  console.log(marker);
                  activeLayer.addLayer(marker);*/
                } //for

                mapLayers[query] = L.mapbox.featureLayer().setGeoJSON(geojson);
                mapLayers[query].on('mouseover', function(e) {
                  e.layer.openPopup();
                }).on('mouseout', function(e) {
                  e.layer.closePopup();
                }).on('click', function(e) {
                  var props = e.layer.feature.properties.details;
                  $mapWrap.addClass("details-open");
                  //if (e.layer.feature.properties.url != undefined) {
                  //  window.location = props.url;
                  //}d
                  //else {
                    $scope.details = props;
                    $scope.$apply();
                    var url = 'https://maps.googleapis.com/maps/api/place/search/json?' + $.param({
                      location: e.layer.feature.geometry.coordinates[1] +','+ e.layer.feature.geometry.coordinates[0],
                      type: query.replace(' station', ''),
                      search: props.title,
                      key: 'AIzaSyAqSVs6Hsk1EjKiSa4TV9fykhB7K3ijkaM',
                      sensor: true,
                      radius: 250
                    });

                    $.getJSON($scope.$parent.$root.proxyUrl + '?url='+ encodeURIComponent(url), {}, function(data) {
                      if (data.status == 'OK') {
                        if (data.results[0]) {
                          var url = 'https://maps.googleapis.com/maps/api/place/details/json?' + $.param({
                            key: 'AIzaSyAqSVs6Hsk1EjKiSa4TV9fykhB7K3ijkaM',
                            placeid: data.results[0].place_id
                          });
                          $.getJSON($scope.$parent.$root.proxyUrl + '?url='+ encodeURIComponent(url), {}, function(data) {
                            if (data.status == 'OK' && data.result != undefined) {
                              $scope.details.website = data.result.website;
                              $scope.googleLocal = data.result;
                              $scope.googleLocal.hours = data.result.opening_hours != undefined ? data.result.opening_hours.weekday_text.join('<br/>') : false;
                              $scope.$apply();
                            }
                          });
                          

                        }
                      }
                    });
                    //console.log('https://maps.googleapis.com/maps/api/place/search/json?location='+e.layer.feature.geometry.coordinates[1]+','+e.layer.feature.geometry.coordinates[0]+'&key=AIzaSyAqSVs6Hsk1EjKiSa4TV9fykhB7K3ijkaM&radius=100&sensor=true');
                    //https://developers.google.com/places/webservice/search?hl=en
                  //}
                })

                
                mapLayers[query].addTo(map);

              })
            
            //}

          }


          function addSeeClickFixLayer(status) {
            var query = 'seeclickfix ' + status;

            var layer = L.mapbox.featureLayer();

            var geojson = {
              type: 'FeatureCollection',
              features: []
            };


            /* Query Foursquare API for venue recommendations near the current location. */
            var url = 'https://seeclickfix.com/api/v2/issues?&callback=?&' + $.param({
              lat: config.lat,
              lng: config.lng,
              zoom: map.getZoom() -1,
              per_page: 50,
              sort: 'created_at',
              status: status
            });
            $.getJSON(url, {}, function(data) {
              var venues = data.issues;
              
              /* Place marker for each venue. */
              for (var i = 0; i < venues.length; i++) {
                var props = venues[i];
                var color = 
                  props.status == 'Acknowledged' ? '#E3B14D' : 
                  props.status == 'Open' ? '#E76C6D' : 
                  props.status == 'Closed' ? '#9BBF6A' : 
                   '#CCCCCC' // Archived;
                props['marker-color'] = color;
                props['marker-size'] = 'small';
                props['marker-symbol'] = props.media.image_full != undefined ? 'star' : 'star-stroked';
                props.title = props.summary;
                //props.body = props.description;
                //angular.copy(props.description, props.body);
                props.description = '<div class="seeclickfix-status status-'+ props.status +'">'+ props.status +'</div><div class="date">Reported on '+ props.created_at +'</div>';
                geojson.features.push({
                  type: 'Feature',
                  properties: props,
                  geometry: {
                    type: 'Point',
                    coordinates: [venues[i]['lng'], venues[i]['lat']]
                  }
                })

              } //for
              mapLayers[query] = L.mapbox.featureLayer().setGeoJSON(geojson);
              mapLayers[query].on('mouseover', function(e) {
                e.layer.openPopup();
              }).on('mouseout', function(e) {
                e.layer.closePopup();
              }).on('click', function(e) {
                $mapWrap.addClass("details-open");
                var props = e.layer.feature.properties;
                //console.log(e.layer.feature);
                //if (e.layer.feature.properties.url != undefined) {
                //  window.location = props.url;
                //}d
                //else {
                  $scope.seeclickfix = props;
                  $scope.$apply();
                  //https://developers.google.com/places/webservice/search?hl=en
                //}
              })

              
              mapLayers[query].addTo(map);

            })
          }

        }
      });
    }
  }
});
