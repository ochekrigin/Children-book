(function ($, window, document, undefined) {
	'use strict';

	var win = $(window),
		html = $('html'),
		body = $('body'),
		isTouchDevice = /MSIE 10.*Touch/.test(navigator.userAgent) || ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
		desktopClass = 'is-desktop',
		loader = body.find('.loader'),
		loadingClass = 'loading',
		jsReadyClass = 'js-ready',
		btnShow = body.find('[data-show]'),
		tooltipBox = body.find('.tooltip-box'),
		btnShowTooltip = body.find('[data-rolover]'),
		showClass = 'show',
		hideClass = 'hidden',
		touchDevice = 'touch',
		loaderDelay,
		dataLoaderHidden = body.find('[data-loader-hidden]');
		if (dataLoaderHidden.length) {
			loaderDelay = 100;
		} else {
			loaderDelay = 3000;
		}

	if (!isTouchDevice) {
		body.addClass(desktopClass);
	}

	// add class utility initialization
	if (typeof window.utilities.addClass === 'function') {
		window.utilities.addClass({
			selector: '[data-add-class]',
			parentToAddSelector: '[data-add-class-parent]',
			removeOnOutsideClick: true
		});
	}

	// char count utility initialization
	if (typeof window.utilities === 'object' && typeof window.utilities.charCount === 'function') {
		window.utilities.charCount();
	}

	// init jquery lazyload
	/* jshint ignore:start */
	if (typeof $ === 'function' && typeof $.fn.lazyload === 'function') {
		if (isTouchDevice) {
			body.find('img.lazy').lazyload({
				skip_invisible: true,
				placeholder: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
			});
		}
		else {
			body.find('img.lazy').lazyload({
				skip_invisible: true,
				threshold: 600,
				placeholder: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
			});
		}
	}
	/* jshint ignore:end */

	// init jquery form validator
	if (typeof $ === 'function' && typeof $.fn.formValidator === 'function') {
		body.find('.checkout-form').formValidator({
			minLength: 2,
			validAttr: 'data-valid',
			addClassAt: '.form-control',
			regExp: {
				text: /^/,
				email: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
				tel: /^[0-9\+\ \-]+$/,
				number: /^\d+$/
			},
			addValidFunc: function (item, ui) {
				// data validation
				var curItem = $(item),
					curValue = parseInt(curItem.val(), 10),
					valueYear = parseInt(ui.form.find('[data-year]').val(), 10),
					month = parseInt(new Date().getMonth() + 1, 10),
					year = parseInt(new Date().getYear() - 100, 10);

				if (curItem.data('month')) {
					if (curValue <= 0 || curValue > 12 || valueYear < year) {
						return false;
					} else if (valueYear === year && month > curValue) {
						return false;
					}
				} else if (curItem.data('year')) {
					if (year > curValue || curValue === 0) {
						return false;
					}
				}

				return true;
			},
			onSubmit: function (e, ui) {
				var self = this,
					cur = jQuery(e.currentTarget),
					url = cur.attr('action');

				if (ui.passValid) {
					if (cur.data('ajax')) {
						e.preventDefault();
						$.ajax({
							url: url,
							dataType: 'html',
							type: 'POST',
							data: cur.serialize()
						}).success(function () {
							if (self.errorItems.length === 0) {
								var infoPopup = body.find('#welcome-lightbox');
								if (infoPopup.length) {
									 $.fancybox.open(infoPopup);
									 self.dataItem.trigger('reset');
								}
							}
						}).error(function () {
							$.fancybox.close();
						});
					}
				} else {
					e.preventDefault();
				}
			}
		});

		body.find('.login-box form').formValidator({
			addClassAt: '.row'
		});
		body.find('.contacts-form').formValidator();
		body.find('#preview_form').formValidator({
			onSubmit: function (e, ui) {
				if (!ui.passValid) {
					e.preventDefault();
				}
			}
		});
		body.find('.data-form').formValidator({
			items: '[data-type-required], .required',
			addClassAt: '.form-control, .select-holder',
			minLength: 1,
			addValidFunc: function (item) {
				if (!$(item).is(':submit')) {
					return item.value !== jQuery(item).attr('placeholder');
				} else {
					return true;
				}
			},
			onSubmit: function (e, ui) {
				var self = this,
					cur = jQuery(e.currentTarget),
					url = cur.attr('action');

				if (ui.passValid) {
					if (cur.data('ajax')) {
						e.preventDefault();
						$.ajax({
							url: url,
							dataType: 'html',
							type: 'POST',
							data: cur.serialize()
						}).success(function () {
							if (self.errorItems.length === 0) {
								var infoPopup = body.find('#welcome-lightbox');
								if (infoPopup.length) {
									 $.fancybox.open(infoPopup);
									 self.dataItem.trigger('reset');
								}
							}
						}).error(function () {
							$.fancybox.close();
						});
					}
				} else {
					e.preventDefault();
				}
			}
		});

	}

	// bind event on currency select
	body.find('select[name="currency"]').each(function () {
		var cur = $(this);

		cur.on('change', function () {
			$.get('/currency/', {code: $(this).val()}, function() {
				location.reload();
			});
		});
	});

	// init autosize textarea
	if (typeof autosize === 'function') {
		var expandingTextarea = body.find('[data-role="expanding-textarea"]');

		if (expandingTextarea.length) {
			expandingTextarea.addClass(jsReadyClass);
			autosize(expandingTextarea);
		}
	}

	function showLoader () {

		var setInterval;

		setTimeout(function () {
			loader.show();
		}, 100);
		setTimeout(function () {
			body.addClass('animation-is-completed');
			if (body.hasClass('animation-is-completed') && !body.hasClass('window-is-loaded')) {
		    	loader.hide();
		    	body.removeClass('animation-is-completed');
		    	setInterval = setTimeout(showLoader);
		    } else {
		      clearInterval(setInterval);
		      loader.hide();
		      body.removeClass(loadingClass);
			}
	    }, loaderDelay);
	}

	if (loader.length) {
		if (typeof $.fn.imagesLoaded === 'function') {
			// jQuery
			$('.loader .step-3 .ill-holder').imagesLoaded( { background: true }, function() {
				loader.css('display', 'block');
				setTimeout(function () {
				    if (body.hasClass('window-is-loaded')) {
						loader.hide();
						body.removeClass(loadingClass);
						body.addClass('animation-is-completed');
					} else {
						loader.hide();
						showLoader();
					}
				}, loaderDelay);
			});
		}

		if (!dataLoaderHidden.length) {
			if (typeof window.utilities === 'object') {
				if (typeof window.utilities.calculateScrollWidth === 'function') {
					window.utilities.calculateScrollWidth();
				}

				if (typeof window.utilities.compensateScrollbarWidth === 'function') {
					window.utilities.compensateScrollbarWidth();
				}
			}
		}

		win.load(function () {
			if (typeof window.utilities === 'object' && typeof window.utilities.resetScrollbarWidth === 'function') {
				window.utilities.resetScrollbarWidth();
			}

			if (body.hasClass('animation-is-completed')) {
		    	loader.hide();
		    	body.removeClass(loadingClass);
		    }

		    body.addClass('window-is-loaded');
		});
	}

	if (typeof jQuery.fn.scrollGallery === 'function') {
		jQuery('.scroll-gallery').scrollGallery({
			mask: 'div.holder',
			slider: '.slider',
			slides: '> li',
			disableWhileAnimating: true,
			circularRotation: true,
			pauseOnHover: false,
			autoRotation: false,
			maskAutoSize: false,
			switchTime: 2000,
			animSpeed: 600,
			step: 1
		});
	}

	// initialization jquery placeholder
	if (typeof $ === 'function' && typeof $.fn.placeholder === 'function') {
		body.find('input, textarea').placeholder();
	}

	// init fancybox
	if (typeof $.fn.fancybox === 'function') {
		body.find('.open-fancybox').fancybox({
			openEffect: 'none',
			scrollOutside: true,
			closeEffect: 'none',
			maxWidth: '100%',
			autoCenter: false,
			minWidth: 500,
			ajax : {
	            type    : 'GET'
	        },
			helpers: {
				media: {},
				overlay: {
					locked: false
				}
			},
			beforeLoad: function() {
				var currentElement = $(this.element),
					cssWrapperClass;

				cssWrapperClass = currentElement.data('lightbox-type') ? currentElement.data('lightbox-type') : '';
				$(this)[0].wrapCSS = cssWrapperClass;
			},
			beforeShow: function () {
				var textareaBox = $(this.wrap[0]).find('[data-char-count-container]');
				if (textareaBox.length) {
					var textarea = textareaBox.find('textarea'),
						preBlock = textareaBox.find('.pre').html(textarea.val().replace(/\r?\n/g,'<br>')),
						liheHeight = Math.round(preBlock.css('line-height').match(/(\+|-)?((\d+(\.\d+)?)|(\.\d+))/)[0]),
						itemHeight = preBlock.height(),
						diff = Math.round(itemHeight / liheHeight);
					textareaBox.find('[data-line-count-number]').text('').text(textareaBox.data('line-limit') - diff);
					// char count utility initialization
					if (typeof window.utilities === 'object' && typeof window.utilities.charCount === 'function') {
						window.utilities.charCount();
					}
				}
				if ($(this.wrap[0]).find('[data-book-gallery]').length) {
					window.book.init();
				}
			}
		});

		body.find('.open-ajax-fancybox').fancybox({
			openEffect: 'none',
			scrollOutside: true,
			closeEffect: 'none',
			maxWidth: '100%',
			autoCenter: false,
			minWidth: 1300,
			minHeight: 500,
			width: '100%',
			ajax : {
	            type    : 'GET'
	        },
			helpers: {
				media: {},
				overlay: {
					locked: false
				}
			},
			beforeLoad: function() {
				var currentElement = $(this.element),
					cssWrapperClass;

				cssWrapperClass = currentElement.data('lightbox-type') ? currentElement.data('lightbox-type') : '';
				$(this)[0].wrapCSS = cssWrapperClass;
			},
			beforeShow: function () {
				if ($(this.wrap[0]).find('[data-book-gallery]').length) {
					window.book.init();
				}
			}
		});

		body.find('.fancybox-media').fancybox({
			type: "iframe",
			iframe : {
				preload: false
			},
			helpers: {
				media: {},
				overlay: {
					locked: false
				}
			},
			afterLoad: function () {
				this.inner.closest('.fancybox-skin').addClass('has-video');
			}
		});

		body.find('[data-role="close-lightbox"]').on({
			'click': function (e) {
				e.preventDefault();

				$.fancybox.close();
			}
		});

		body.find('.close-popup').on('click', function(e) {
			$.fancybox.close();
			e.preventDefault();
		});
	}

	if (typeof $.fn.datepicker === 'function') {
		var datePicker = body.find('.datepicker');
		if (datePicker.length) {
			datePicker.datepicker();
		}
	}

	if (btnShow.length) {
		btnShow.on('click', function (e) {
			e.preventDefault();

			$(this).addClass(hideClass).siblings('.slide').addClass(showClass);
		});
	}

	if (isTouchDevice) {

		body.addClass(touchDevice);

		if (btnShowTooltip.length) {
			btnShowTooltip.on('click', function (e) {
				e.preventDefault();

				if (tooltipBox.hasClass(showClass)) {
					tooltipBox.removeClass(showClass);
				} else {
					tooltipBox.addClass(showClass);
				}
			});
		}

		html.on('click', function () {
			tooltipBox.removeClass(showClass);
		});
		tooltipBox.on('click', function (e) {
			e.stopPropagation();
		});
	}

})(jQuery, window, window.document);