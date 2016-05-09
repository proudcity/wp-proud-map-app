<?php
/**
 * @author ProudCity
 */

use Proud\Core;

class LocalMap extends Core\ProudWidget {

  // proud libraries
  public static $libaries;

  function __construct() {
    parent::__construct(
      'proud_map_app', // Base ID
      __( 'ProudCity services map', 'wp-proud-map-app' ), // Name
      array( 
        'description' => __( 'An interactive services map of for your city', 'wp-proud-map-app' ),
      ) // Args
    );
  }

  function initialize() {
    $options = array(
      'foursquare' => 'Foursquare',
      'wordpress' => 'Wordpress',
    );
    $this->settings = [
      'source' => [
        '#title' => 'Source',
        '#type' => 'radios',
        '#options' => $options,
        '#default_value' => 'foursquare',
        '#to_js_settings' => true
      ],
    ];
    // Get answers topics
    $topics = get_categories( [
      'taxonomy' => 'location-taxonomy',
      //'orderby' => 'name',
      'parent' => 0
    ] );
    $options = [];
    if( !empty( $topics ) && empty( $topics['errors'] ) ) {
      foreach ( $topics as $topic ) {
        $options['wordpress:' . $topic->slug . ':' . $topic->name] = $topic->name;
      }
    }
    $this->settings += [
      'wordpress_layers' => [
        '#title' => 'Layers',
        '#type' => 'checkboxes',
        '#options' => $options,
        '#default_value' => ['all'],
        '#description' => 'Click all layers you would like to appear',
        '#to_js_settings' => true,
        '#states' => [
          'visible' => [
            'source' => [
              'operator' => '==',
              'value' => ['wordpress'],
              'glue' => '||'
            ],
          ],
        ],
      ],
    ];
    $this->settings += [
      'zoom' => [
        '#title' => 'Default zoom level',
        '#type' => 'select',
        '#options' => array(
          13 => 13,
          14 => 14,
          15 => 15,
          16 => 16,
        ),
        '#description' => 'A higher zoom level is more zoomed in.',
        '#default_value' => 15,
        '#to_js_settings' => true
      ],
    ];
    parent::initialize();
  }

  public function registerLibraries() {
    global $proudcore;
    $proudcore::$libraries->addMaps();
    $proudcore::$libraries->addAngular(true, true, true);
  }

  public function enqueueFrontend() {
    $path = plugins_url('../includes/js/',__FILE__);
    // Running script
    wp_enqueue_script('proud-map-app', $path . 'proud-map-app.js', array('angular'), false, true);
    // Angular resources
    $path .= 'proud-map-app/dist/';
    // Not needed since moving map stuff to libraries
    // wp_enqueue_script('proud-map-app-libraries', $path . 'js/libraries.min.js', array('angular'), false, true);
    wp_enqueue_script('proud-map-app-app', $path . 'js/app.min.js', array('angular'), false, true);
    wp_enqueue_script('proud-map-app-templates', $path . 'views/app.templates.js', array('proud-map-app-app'), false, true);
    // CSS
    wp_enqueue_style('proud-map-app-css', $path . 'css/app.min.css');

    // Add global settings
    parent::addJsSettings(array(
     //'payment_key' => '', //@todo
     'api_path' => get_option( 'proudcity_api', '/wp-json/wp/v2/locations/' ),
     //'payment_url' => '',
     //'track_url' => '',
     //'seeclickfixUrl' => '',
    ), true);
  }

  /**
   * Front-end display of widget.
   *
   * @see WP_Widget::widget()
   *
   * @param array $args     Widget arguments.
   * @param array $instance Saved values from database.
   */
  public function printWidget( $args, $instance ) {

    // Compile html into a url encoded string
    $lazy_html = rawurlencode(
      '<div map-parent></div>'
    );
    
    ?>
    <div id="<?php print $this->id ?>">
      <div ng-init="$root.appId = '<?php print $this->id; ?>'" in-view="mapCompile = mapCompile || '<?php print $lazy_html; ?>'" lazy-compile="mapCompile" lazy-decode="true" lazy-timeout="'<?php print $lazy_html; ?>'" lazy-timeout-dur="2000"></div>
    </div>
    <?php
  }
}

// register Foo_Widget widget
function register_map_feed_widget() {
  register_widget( 'LocalMap' );

}
add_action( 'widgets_init', 'register_map_feed_widget' );