'use strict';

angular.module('mapApp', [
  'ngSanitize',
  'ngResource'
])

.run(
  [          '$rootScope', '$window', '$location', 
    function ($rootScope,   $window,   $location) {
      // Capture url for back button
      $rootScope.$on('$locationChangeSuccess', function() {
        $rootScope.actualLocation = $location.absUrl();
      });        
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


.directive('proudMap', function factory($window, $browser, $http, $location, $rootScope) {
  return {
    restrict: 'A',
    templateUrl: 'views/apps/mapApp/map.html',
    replace: false,
    scope: {
      proudMap: '='
    },
    link: function($scope, $element, $attrs) {
      $scope.details = {};

      var $mapWrap = $('#map-wrapper'),
          $body    = $('body');

      // Set up full screen action
      $scope.toggleFullScreen = function(e) {
        if(e) {
          e.preventDefault();
          e.stopPropagation();
        }
        $rootScope.fullScreen = !$rootScope.fullScreen;
        $body.toggleClass('proud-map-fullscreen');
      }
      // Expand map if closed
      $mapWrap.click(function(e) {
        if(!$rootScope.fullScreen) {
          $scope.toggleFullScreen(e);
          //window.map.invalidateSize();
        }
      });
      // Listen for esc key
      $body.keydown(function(e) {  //keypress did not work with ESC;
        if (e.which == '27' && $rootScope.fullScreen) {
          $scope.toggleFullScreen();
        }
      }); 
      // Listen for back button
      $rootScope.$watch(function () { return $location.absUrl() }, function (newLocation, oldLocation) {
        if($rootScope.actualLocation === newLocation && $rootScope.fullScreen) {
            $scope.toggleFullScreen();
        }
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

      $scope.$watch('proudMap', function(settings){
        console.log(settings);

        if (_.has(settings, 'lat')) {

          var layers = document.getElementById('menu-ui');
          var mapLayers = {};

          // @todo: get from $rootSCope
          L.mapbox.accessToken = 'pk.eyJ1IjoiYWxiYXRyb3NzZGlnaXRhbCIsImEiOiI1cVUxbUxVIn0.SqKOVeohLfY0vfShalVDUw';

          var map = new L.mapbox.Map('map', 'albatrossdigital.lpkdpcjb', {
              center: new L.LatLng(settings.lat, settings.lng),
              zoom: 15,
              scrollWheelZoom: false,
              zoomControl: false
          });
          new L.Control.Zoom({ position: 'topright' }).addTo(map);
          window.map = map;

          var activeLayers = _.get(Proud, 'settings.proud_map_app.instances.' + $rootScope.appId + '.layers');
          activeLayers = (typeof activeLayers == 'string') ? activeLayers.split("\n") : activeLayers;
          var i = 0;
          $.each( activeLayers, function( key, value ) {
            var layer = value.split(':');
            addLayer(layer[2], layer[0], null, layer[1], i==0);
            i++;
            console.log(layer);
          });            

          
          function addLayer(name, type, zoom, query, active) {
              active = active == undefined ? false : active;

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
                  $('#menu-ui a.active').removeClass('active');
                  
                  this.className = 'active';

                  //var key = $.inArray( query, mapLayers );
                  //if ( key != -1) {
                  //  return map.setLayoutProperty(mapLayers[key], 'visibility', 'visible');
                  //}

                  // @todo: attribution

                  //map.setView(new L.LatLng(settings.lat, settings.lng), zoom, {animate: true});
                  
                  //map.invalidateSize();
                  

                  switch(type) {
                    case 'wordpress':
                    console.log(query);
                      addWordpressLayer(query);
                      //attr.addAttribution('This website');
                      break;
                    case 'foursquare':
                      if (Array.isArray(query)) {
                        for (var i=0; i<query.length; i++) {
                          addFoursquareLayer(query[i], 'large');
                        }
                      }
                      else {
                        addFoursquareLayer(query, 'large');
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
                  }

                  //@todo:
                  // If actual click, then toggle filters
                  //if(layersInit) {
                  //  $scope.toggleFilter();
                  //}
            
              };
              if (active) {
                $(link).trigger('click');
              }


              layers.appendChild(link);
          }
          
          function addWordpressLayer(query) {
            console.log(settings.wordpress.apiUrl);
            var url = settings.wordpress.apiUrl + '?direction=ASC&filter%5Blocation-taxonomy%5D='+ query +'&sort=date';
            $.getJSON(url, {}, function(data) {
              console.log(data);
              var geojson = {
                type: 'FeatureCollection',
                features: []
              };
              for ( var i=0; i < data.length; i++ ) {
                var item = data[i];
                var properties = item.meta;
                var marker = iconColor(query);
                $.extend(properties, marker, {
                  title: item.title.rendered,
                  //'marker-size': size,
                });
                geojson.features.push({
                  type: 'Feature',
                  properties: properties,
                  geometry: {
                    type: 'Point',
                    coordinates: [item.meta.lng, item.meta.lat]
                  }
                });
              }
              console.log(geojson);
              
              mapLayers[query] = L.mapbox.featureLayer().setGeoJSON(geojson);
              mapLayers[query].on('mouseover', function(e) {
                e.layer.openPopup();
              }).on('mouseout', function(e) {
                e.layer.closePopup();
              }).on('click', function(e) {
                var props = e.layer.feature.properties;
                props.type = 'wordpress';
                props.location = props;
                props.location.postalCode = props.zip;
                props.googleLocal = {
                  hours: props.hours
                }
                console.log(props);
                $mapWrap.addClass("details-open");
                $scope.details = props;
                $scope.$apply();
              });

              mapLayers[query].addTo(map);

            });
          }

          function addFoursquareLayer(query, size) {
            /* Query Foursquare API for venue recommendations near the current location. */
            //if (mapLayers[query] != undefined) {
            //  console.log(mapLayers[query]);
            //  mapLayers[query].addTo(map);
            //}
            //else {

              var url = settings.foursquare.apiUrl + 'v2/venues/explore?ll=' + settings.lat + ',' + settings.lng + '&query=' + query + '&client_id=' + settings.foursquare.clientKey + '&client_secret=' + settings.foursquare.clientSecret +'&v=20140601';
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
                  var marker = iconColor(category);
                  geojson.features.push({
                    type: 'Feature',
                    properties: {
                      title: venues[i]['venue']['name'],
                      'marker-color': marker['marker-color'],
                      //'marker-size': size,
                      'marker-symbol': marker['marker-icon'],
                      'url': venues[i]['venue']['url'] != undefined ? venues[i]['venue']['url'] : undefined,
                      'details': venues[i]['venue']
                    },
                    geometry: {
                      type: 'Point',
                      coordinates: [venues[i]['venue']['location']['lng'], venues[i]['venue']['location']['lat']]
                    }
                  })

                } //for

                mapLayers[query] = L.mapbox.featureLayer().setGeoJSON(geojson);
                mapLayers[query].on('mouseover', function(e) {
                  e.layer.openPopup();
                }).on('mouseout', function(e) {
                  e.layer.closePopup();
                }).on('click', function(e) {
                  var props = e.layer.feature.properties.details;
                  props.type = 'foursquare';
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
              lat: settings.lat,
              lng: settings.lng,
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
                props['marker-size'] = 'large';
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

          function iconColor(category) {
            var color = '#997C61';
            var icon = 'marker';
            category = category.toLowerCase();
            if (category.indexOf('library') !=-1) {
              icon = 'library';
              color = '#A973A9';
            }
            else if (category.indexOf('school') !=-1 || category.indexOf('college') !=-1 || category.indexOf('university') !=-1) {
              icon = 'college';
              color = '#ED9356';
            }
            else if (category.indexOf('police') !=-1) {
              icon = 'police';
              color = '#456D9C';
            }
            else if (category.indexOf('fire') !=-1) {
              icon = 'fire-station';
              color = '#E76C6D';
            }
            else if (category.indexOf('post') !=-1) {
              icon = 'post';
              color = '#5A97C4';
            }
            else if (category.indexOf('park') != -1 || category.indexOf('field') != -1) {
              icon = 'park';
              color = '#9BBF6A';
            }
            return {
              'marker-symbol': icon,
              'marker-color': color
            };
          }
          

        }
      });
    }
  }
});
