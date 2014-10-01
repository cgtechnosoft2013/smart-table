/*
 * Ajax overlay 1.0
 * Author: Simon Ilett @ aplusdesign.com.au
 * Descrip: Creates and inserts an ajax loader for ajax calls / timed events
 * Date: 03/08/2011
 * 
 * Updated by Smart Data Lab 01/10/2014
 */
function AjaxLoader (el, options) {
    // Becomes this.options
    var defaults = {
        bgColor         : 'rgba(255, 255, 255, 0.5)',
        overlayClass 	: 'ajax-overlay',
        loaderType      : 'div',
        loaderClass     : 'ajax-overlay-loader'
    };
    this.options 	= jQuery.extend(defaults, options);
    this.container 	= $(el);

    this.init = function() {
        var container = this.container;
        container.css({
           'position':'relative'
        });
        // Delete any other loaders
        this.remove(this.container);
        // Create the overlay
        var overlay = $('<div></div>').css({
            'background-color': this.options.bgColor,
            'width':'100%',
            'height':'100%',
            'position':'absolute',
            'top':'0px',
            'left':'0px',
            'z-index':99999
        }).addClass(this.options.overlayClass);

        // insert overlay and loader into DOM
        container.append(
            overlay.append(
                $('<' + this.options.loaderType + '></' + this.options.loaderType + '>').addClass(this.options.loaderClass)
            )
        );
    };
    

    this.remove = function(){
        var overlay = this.container.children('.' + this.options.overlayClass);
        if (overlay.length) {
            overlay.remove();
        }
    };

    //this.init();
}

// add to jquery (Smart Data Lab 01/10/2014)
(function ($) {

  $.fn.loadingOverlay = function (method, options) {
      if(method === 'init') {
          var loader = new AjaxLoader(this, options);
          loader.init();
      }
      if(method === 'remove') {
          var loader = new AjaxLoader(this, options);
          loader.remove();
      }
  };

}(jQuery));