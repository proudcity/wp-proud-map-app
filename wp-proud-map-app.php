<?php
/*
Plugin Name:        Proud Map App
Plugin URI:         http://getproudcity.com
Description:        ProudCity distribution
Version:            1.0.0
Author:             ProudCity
Author URI:         http://getproudcity.com

License:            MIT License
License URI:        http://opensource.org/licenses/MIT
*/

namespace Proud\MapApp;

if ( ! function_exists( 'proud_map_init_widget' ) ) {
  // Init on plugins loaded
  function proud_map_init_widget() {
    require_once plugin_dir_path(__FILE__) . '/lib/local-map-widget.class.php';
  }
}

add_action('plugins_loaded', __NAMESPACE__ . '\\proud_map_init_widget');