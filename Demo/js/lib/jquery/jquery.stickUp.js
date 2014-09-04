// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;
(function($, window, document, undefined) {

	// undefined is used here as the undefined global variable in ECMAScript 3 is
	// mutable (ie. it can be changed by someone else). undefined isn't really being
	// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
	// can no longer be modified.

	// window and document are passed through as local variable rather than global
	// as this (slightly) quickens the resolution process and can be more efficiently
	// minified (especially when both are regularly referenced in your plugin).

	// Create the defaults once
	var pluginName = "stickUp";
	var defaults = {
		topMargin: null,
		onStick: null,
		unStick: null
	};

	// The actual plugin constructor
	function Plugin(element, options) {
		// jQuery has an extend method which merges the contents of two or
		// more objects, storing the result in the first object. The first object
		// is generally empty as we don't want to alter the default options for
		// future instances of the plugin
		this.settings = $.extend({}, defaults, options);
		if ($(element).length > 0) {
			this.settings.element = $(element);
			this.settings.win = $(window);
			this.settings.doc = $(document);
			this.settings._defaults = defaults;
			this.init();
		}
	}

	// Avoid Plugin.prototype conflicts
	$.extend(Plugin.prototype, {
		vars: {},
		init: function() {
			var self = this,
				$this = self.settings.element;
			// adding a class to users div
			$this.addClass('stuckMenu');
			// If is null, set to 0, else force to string then parseInt;
			self.vars.topMargin = (self.settings.topMargin == null ? 0 : parseInt("" + self.settings.topMargin));
			// If set to auto, grab from element.
			if (self.settings.topMargin == 'auto') {
				self.vars.topMargin = parseInt($this.css('margin-top'));
			} else {
				self.vars.topMargin = (isNaN(self.vars.topMargin) ? 0 : self.vars.topMargin);
			}
			self.vars.stickyHeight = parseInt($this.height());
			self.vars.stickyMarginB = parseInt($this.css('margin-bottom'));
			self.vars.currentMarginT = parseInt($this.next().closest('div').css('margin-top'));
			self.vars.vartop = parseInt($this.offset().top);
			// Now that we've setup our initial info, bind the events.
			self.events();
		},
		events: function() {
			var self = this,
				$this = self.settings.element;
			self.settings.win.scroll(function(event) {
				var st = $(this).scrollTop();
				self.vars.scrollDir = (st > self.vars.lastScrollTop ? 'down' : 'up');
				self.vars.lastScrollTop = st;
			});
			// Setup the document scroll event.
			self.settings.doc.on('scroll', function() {
				self.vars.varscroll = parseInt(self.settings.doc.scrollTop());

				if (self.vars.vartop < self.vars.varscroll + self.vars.topMargin) {
					if (!$this.hasClass('isStuck')) {
						$this.addClass('isStuck');
						$this.css({
							position: "fixed",
							top: 0
						});
						// Call the onstick function if set.
						if (typeof(self.settings.onStick) == 'function') {
							self.settings.onStick.apply(self, [self.settings]);
						}
					}
				};

				if (self.vars.varscroll + self.vars.topMargin < self.vars.vartop) {
					if ($this.hasClass('isStuck')) {
						$this.removeClass('isStuck');
						$this.css("position", "relative");
						// Call the onstick function if set.
						if (typeof(self.settings.unStick) == 'function') {
							self.settings.unStick.apply(self, [self.settings]);
						}
					}
				};

			});
		}
	});

	// A really lightweight plugin wrapper around the constructor,
	$.fn[pluginName] = function(options) {
		this.each(function() {
			$.data(this, "plugin_" + pluginName, new Plugin(this, options));
		});
		return this;
	};

})(jQuery, window, document);