angular.module('mapAppParent').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/apps/mapApp/map.html',
    "<div id=\"map-wrapper\" ng-class=\"{'details-open': detailsOpen}\"><div class=\"fullscreen-wrap\"><div class=\"overflow map-slider\"><div class=\"menu-pane\"><nav id=\"menu-ui\" class=\"menu-ui\"></nav></div><div class=\"map-pane\"><a class=\"btn btn-xs btn-default visible-xs-block filter-button\" href=\"\" ng-click=\"toggleFilter($event)\"><i class=\"fa fa-filter\"></i> <span>Filter</span></a> <a class=\"btn btn-xs btn-default full-screen-button\" href=\"\" ng-click=\"toggleFullScreen($event)\"><i class=\"fa fa-times-circle\"></i> <span>Close</span></a><div id=\"map\"></div></div><div class=\"details\"><a href=\"#\" id=\"details-close\"><i class=\"fa fa-times-circle\"></i><!--<span class=\"element-invisible\">Close</span>--></a><div><!-- foursquare --><div class=\"col-xs-12\" ng-if=\"details.type == 'wordpress'\"><h3><span ng-bind-html=\"details.title\"></span> <small></small></h3><p ng-bind-html=\"details.content.rendered\"></p></div><!-- seeclickfix --><div ng-if=\"seeclickfix\"><h3>{{seeclickfix.title}} <small class=\"seeclickfix-status status-{{seeclickfix.status}}\">{{seeclickfix.status}}</small></h3><p><div class=\"date\">Reported on {{seeclickfix.created_at | date:'medium'}}</div></p><p><strong>{{seeclickfix.address}}</strong></p><p>{{seeclickfix.body}}</p><p class=\"text-center\"><img ng-if=\"seeclickfix.media.image_full\" ng-src=\"{{seeclickfix.media.image_full}}\" alt=\"Photograph\" style=\"max-height:300px\"></p></div><!-- foursquare --><div class=\"col-xs-12\" ng-if=\"details.type == 'foursquare'\"><h3>{{details.name}} <small>{{details.categories[0].name}}</small></h3></div><!-- address --><div class=\"col-xs-12\"><div ng-if=\"details.location\" style=\"margin-bottom: 20px\"><p>{{details.location.address}}<br>{{details.location.city}}, {{details.location.state}} {{details.location.postalCode}}</p><div class=\"row\"><div class=\"col-xs-6\"><a class=\"btn btn-default btn-xs\" ng-href=\"https://www.google.com/maps/dir/{{details.location.address}}, {{details.location.city}}, {{details.location.state}} {{details.location.postalCode}}\" target=\"_blank\">Get directions <i class=\"fa fa-location-arrow\"></i></a></div><div ng-if=\"details.website\" class=\"col-sm-6\"><a class=\"btn btn-primary btn-xs\" ng-href=\"{{details.website}}\" target=\"_blank\">Visit website <i class=\"fa fa-location-arrow\"></i></a></div></div></div><!-- google local --><div ng-if=\"googleLocal.hours\"><div ng-bind-html=\"googleLocal.hours\" class=\"hours-wrapper\"></div><p><strong>Currently <span ng-if=\"googleLocal.opening_hours.open_now\">Open</span><span ng-if=\"!googleLocal.opening_hours.open_now\">Closed</span></strong></p><div class=\"google-powered-by\">Hours <img ng-src=\"{{$root.appPath + 'images/powered-by-google-on-white.png'}}\" alt=\"Place data powered by Google\"></div></div><!-- wordpress --><div ng-if=\"details.content\" ng-bind-html=\"details.content\"></div><!--<p ng-if=\"details.location\">\n" +
    "\t\t\t\t\tCurrently:\n" +
    "\t\t\t\t\t\t<span class=\"text-success\" ng-if=\"details.isOpen\">Open</span>\n" +
    "\t\t\t\t\t\t<span class=\"text-error\" ng-if=\"!details.isOpen\">Closed</span>\n" +
    "\t\t\t\t</p>--></div></div></div></div></div></div>"
  );

}]);
