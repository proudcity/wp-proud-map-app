<?php
/**
 * @author James Laffert
 */

class LocalMap extends WP_Widget {

  // proud libraries
  public static $libaries;

  function __construct() {
    parent::__construct(
      'proud_map_widget', // Base ID
      __( 'ProudCity Map', 'wp-proud-map-app' ), // Name
      array( 'description' => __( 'An interactive localized map interface', 'wp-proud-map-app' ), ) // Args
    );

    // Init proud library on plugins loaded
    add_action( 'init', [$this,'registerLibraries'] );
    // Enqueue local frontend
    add_action('wp_enqueue_scripts', array($this,'enqueueFrontend'));
  }

  public function registerLibraries() {
    global $proudcore;
    $proudcore::$libraries->addAngular(true, false, true);
  }

  public function enqueueFrontend() {
    $path = plugins_url('../includes/js/',__FILE__);
    // Running script
    wp_enqueue_script('proud-map-app', $path . 'proud-map-app.js', array('angular'), false, true);
    // Angular resources
    $path .= 'proud-map-app/dist/';
    wp_enqueue_script('proud-map-app-libraries', $path . 'js/libraries.min.js', array('angular'), false, true);
    wp_enqueue_script('proud-map-app-app', $path . 'js/app.min.js', array('proud-map-app-libraries'), false, true);
    wp_enqueue_script('proud-map-app-templates', $path . 'views/app.templates.js', array('proud-map-app-app'), false, true);
    // CSS
    wp_enqueue_style('proud-map-app-css', $path . 'css/app.min.css');
  }

  /**
   * Front-end display of widget.
   *
   * @see WP_Widget::widget()
   *
   * @param array $args     Widget arguments.
   * @param array $instance Saved values from database.
   */
  public function widget( $args, $instance ) {

    // Compile html into a url encoded string
    $lazy_html = rawurlencode(
      '<div map-parent></div>'
    );

    $app_id = 'proud-map-app';
    
    ?>
    <div id="<?php print $app_id; ?>">
      <div in-view="mapCompile = mapCompile || '<?php print $lazy_html; ?>'" lazy-compile="mapCompile" lazy-decode="true"></div>
    </div>
    <?php
  }

  /**
   * Back-end widget form.
   *
   * @see WP_Widget::form()
   *
   * @param array $instance Previously saved values from database.
   */
  public function form( $instance ) {
    $title = ! empty( $instance['title'] ) ? $instance['title'] : __( 'New title', 'text_domain' );
    ?>
    <p>
    <label for="<?php echo $this->get_field_id( 'title' ); ?>"><?php _e( 'Title:' ); ?></label> 
    <input class="widefat" id="<?php echo $this->get_field_id( 'title' ); ?>" name="<?php echo $this->get_field_name( 'title' ); ?>" type="text" value="<?php echo esc_attr( $title ); ?>">
    </p>
    <?php 
  }

  /**
   * Sanitize widget form values as they are saved.
   *
   * @see WP_Widget::update()
   *
   * @param array $new_instance Values just sent to be saved.
   * @param array $old_instance Previously saved values from database.
   *
   * @return array Updated safe values to be saved.
   */
  public function update( $new_instance, $old_instance ) {
    $instance = array();
    $instance['title'] = ( ! empty( $new_instance['title'] ) ) ? strip_tags( $new_instance['title'] ) : '';

    return $instance;
  }
}

// register Foo_Widget widget
function register_map_feed_widget() {
  register_widget( 'LocalMap' );

}
add_action( 'widgets_init', 'register_map_feed_widget' );