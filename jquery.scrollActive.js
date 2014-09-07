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
	var pluginName = "scrollActive";
	var defaults = {
		scanItems: '.post', // CLASS of elements you want to scan to see if it's in the set area
		scanLimit: 200, // The distance from the top that the plugin scans from
		startScanningAfter: 50, // used so that the first item in the list can be activated on page load
		itemTopOffset: 0, // You can add or even subtract, where the plugin thinks the top of each item is.
		activeClass: 'active',
		pageAnimationSpeed: 300,
		updateHash: true, // If the browser should set the hash when scrolling or clicking he sidebar
		hashPrefix: 'menu_', // Used so that the browser doesn't automatically jump to the id on the page and cause our animation to lag
		debug: false, // enables a visual representation of when items become active
		onScroll: function(settings) {}, // Once user has stopped scrolling and a new element is bound, this callback is activated
		onClickFinish: function() {} // When the user clicks an anchor in the menu this plugin was run on

	};

	// The actual plugin constructor
	function Plugin(element, options) {

		// jQuery has an extend method which merges the contents of two or
		// more objects, storing the result in the first object. The first object
		// is generally empty as we don't want to alter the default options for
		// future instances of the plugin

		this.settings = $.extend({}, defaults, options);
		if ($(element).length > 0 && this.settings.scanItems.length > 0) {
			this.settings.element = element;
			this.settings.menuItems = $(element).find('a');
			this.settings.win = $(window);
			this.settings.doc = $(document);
			this.settings.body = $('body');
			this.settings.allowedScan = true;
			this.settings._defaults = defaults;
			this.init();
		}
	}

	// Avoid Plugin.prototype conflicts
	$.extend(Plugin.prototype, {
		init: function() {
			this.customScroll();
			this.settings.container = $(this.settings.element);
			var bb = {};
			bb.winHeight = this.settings.win.height();
			bb.posY = this.settings.itemTopOffset + this.settings.scanLimit;
			this.settings.scrollTop = this.settings.doc.scrollTop();
			this.settings.boundingBox = bb;

			// Bind events
			this.bindEvents();
			// Draw the debug html on the page to indicate the scan areas
			this.debug();
			// Check our scanItems position
			this.scanItems();
			// If the hash is present on load, move the page to the new location
			this.checkHash();
		},
		checkHash: function() {
			var self = this;

			if (window.location.hash) {
				var oldAnimationSpeed = self.settings.pageAnimationSpeed;
				var hash = window.location.hash.replace(self.settings.hashPrefix, '');
				self.settings.pageAnimationSpeed = 0;
				self.scrollTo(hash);
				setTimeout(function() {
					self.scrollTo(hash);
					self.settings.pageAnimationSpeed = oldAnimationSpeed;
				}, 1);
			}
		},
		updateHash: function(hash) {
			var self = this;
			if (self.settings.updateHash) {
				var h = (typeof(hash) == 'undefined' ? self.settings.lastActiveContainer : hash);
				window.location.hash = self.settings.hashPrefix + h.replace('#', '');
			}
		},
		scanItems: function() {
			var self = this;
			var items = $(this.settings.scanItems);

			if (items.length) {

				if (self.settings.scrollTop < self.settings.startScanningAfter) {
					// activate the first item of the list and the menu
					var menuItems = self.settings.menuItems.first();
					self.bindActive(menuItems);
					var items = $(self.settings.scanItems).first();
					self.bindActive(items);
				} else if (self.settings.scrollTop + self.settings.boundingBox.winHeight == self.settings.doc.height()) {
					// Assume the last item should be activated
					var menuItems = self.settings.menuItems.last();
					self.bindActive(menuItems);
					var items = $(self.settings.scanItems).last();
					self.bindActive(items);
				} else {
					// Not at the bottom or at the top, try and find the active element.
					self.findActiveItem(items);
				}
			}
		},
		findActiveItem: function(items) {
			var self = this;
			// Loop over all items and stop once we find an item that's top position starts after our redZone
			items.each(function() {
				var item = $(this);
				var thisItemsTop = item.offset().top + self.settings.itemTopOffset;
				if (thisItemsTop >= self.settings.boundingBox.posY + self.settings.scrollTop) {
					self.bindActive(item);
					var menuItem = self.settings.container.find('li a[href="#' + $(this).attr('id') + '"]');
					self.bindActive(menuItem);
					return false;
				}

			});
		},
		bindActive: function(elem) {
			var self = this;
			if (elem.length) {
				if (elem.hasClass(self.settings.scanItems.replace('.', ''))) {
					// Assume that we're adding the active class to the content items
					$(self.settings.scanItems).removeClass(self.settings.activeClass);
				} else {
					// Assume that we're adding the active class to the menu items
					self.settings.container.find('li a').removeClass(self.settings.activeClass);
					// Only need to update this here as the content and menu items are updated at the same time.
					self.settings.lastActiveContainer = elem.attr('href');
				}
				elem.addClass(self.settings.activeClass);
			}
		},
		scrollTo: function(identifier, callback) {
			var self = this;
			if ($(identifier).length > 0) {
				$('html, body').stop(true, true).animate({
					scrollTop: $(identifier).offset().top - self.settings.boundingBox.posY
				}, self.settings.pageAnimationSpeed, function() {
					if (typeof callback == 'function') {
						callback.apply();
					}
				});
			}
		},
		bindEvents: function() {
			var self = this;
			// Bind events to the menu items.
			self.settings.menuItems.on('click', function(e) {
				e.preventDefault();
				if (self.settings.allowedScan == true) {
					self.settings.allowedScan = false;
					var item = $(this);
					var href = item.attr('href');
					self.updateHash(href);
					self.scrollTo(href, function() {
						self.bindActive(item);
						self.bindActive($(self.settings.scanItems + href));
						if (typeof(self.settings.onClickFinish) == 'function') {
							self.settings.onClickFinish.apply(self, [item]);
						}
						var t = setTimeout(function() {
							// Crude hack to stop the scan while the page is animating from a clicked element,
							// Setting the timeout + 1 of the animation speed forces the delay/callback to not
							// fire once the page stops animating.
							self.settings.allowedScan = true;
							self.settings.scrollTop = self.settings.doc.scrollTop();
							self.debug();
						}, self.settings.pageAnimationSpeed + 1);
					});
				}
			});

			// Bind a scroll event to the window
			self.settings.win.on('scrollstop', function() {
				if (self.settings.allowedScan == true) {
					self.settings.scrollTop = self.settings.doc.scrollTop();
					self.scanItems();
					self.updateHash();
					self.debug();
					if (typeof(self.settings.onScroll) == 'function') {
						self.settings.onScroll.apply(self, [self.settings]);
					}
				}
			})
		},
		debug: function() {

			var self = this;
			if (self.settings.debug) {
				var bb = this.settings.boundingBox;
				if (typeof(self.settings.zonesAppended) == 'undefined') {
					var defaults = {
						position: 'fixed',
						width: 200,
						top: 0,
						height: self.settings.scanLimit + self.settings.itemTopOffset,
						left: '50%',
						zIndex: 10,
						marginLeft: -100,
						background: 'rgba(255,0,0,0.4)',
					}
					var redZone = $('<div />').css(defaults).addClass('redZone');
					var greenZone = $('<div />').css(defaults).css({
						height: bb.winHeight - self.settings.scanLimit - self.settings.itemTopOffset,
						top: self.settings.scanLimit + self.settings.itemTopOffset,
					}).addClass('greenZone');
					self.settings.zonesAppended = true;
					self.settings.body.append(redZone, greenZone);
					self.settings.greenZone = $('.greenZone');
					self.settings.redZone = $('.redZone');
				}
				if (self.settings.scrollTop < self.settings.startScanningAfter) {

					self.settings.greenZone.css({
						background: 'rgba(255,0,255,0.4)'
					});
				} else {
					self.settings.greenZone.css({
						background: 'rgba(0,255,0,0.4)'
					});
				}
			}
		},
		customScroll: function() {

			// Custom event to delay the standard on scroll event but a latency speed.
			// this avoids the plugin from firing every milisecond, and also speeds it up.
			var self = this;
			var special = $.event.special,
				uid1 = 'D' + (+new Date()),
				uid2 = 'D' + (+new Date() + 1);
			special.scrollstop = {
				latency: self.settings.pageAnimationSpeed - 1,
				setup: function() {

					var timer,
						handler = function(evt) {
							var _self = this,
								_args = arguments;
							if (timer) {
								clearTimeout(timer);
							}
							timer = setTimeout(function() {
								timer = null;
								evt.type = 'scrollstop';
								$.event.dispatch.apply(_self, _args);

							}, special.scrollstop.latency);
						};
					$(this).bind('scroll', handler).data(uid2, handler);
				},
				teardown: function() {
					$(this).unbind('scroll', $(this).data(uid2));
				}
			}
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