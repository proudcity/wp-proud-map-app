
(function($, Proud) {
  $(document).ready(function(){
    Proud.settings.proud_map_app = Proud.settings.proud_map_app || {app_id: 'proud-map-app'};
    if (Proud.settings.proud_map_app!= undefined) {
      var $app = $('#'+Proud.settings.proud_map_app.app_id);
      $app.once('appinit', function() {
        angular.bootstrap($app, ['mapAppParent']);
      });
    }
  });
})(jQuery, Proud);
