<?php
/*
Plugin Name:        Proud Map App
Plugin URI:         http://getproudcity.com
Description:        ProudCity distribution
Version:            1.0.0
Author:             ProudCity
Author URI:         http://getproudcity.com

License:            Affero GPL v3
*/

namespace Proud\MapApp;

// Load Extendible
// -----------------------
if ( ! class_exists( 'ProudPlugin' ) ) {
  require_once( plugin_dir_path(__FILE__) . '../wp-proud-core/proud-plugin.class.php' );
}

class MapApp extends \ProudPlugin {

  function __construct() {

    parent::__construct( array(
      'textdomain'     => 'wp-proud-map-app',
      'plugin_path'    => __FILE__,
    ) );

    $this->hook('plugins_loaded', 'proud_map_init_widget');
  }

  // Init on plugins loaded
  public function proud_map_init_widget() {
    require_once plugin_dir_path(__FILE__) . '/lib/local-map-widget.class.php';
  }
}

new MapApp;