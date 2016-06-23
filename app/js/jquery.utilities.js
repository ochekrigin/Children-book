(function ($, window, document, undefined) {
	'use strict';

	var html = $('html'),
		body = $('body'),
		win = $(window),
		header = body.find('#header'),
		containersCollection = body.find('.container'),
		scrollWidth = 0,
		utilities;

	utilities = (function utils() {
		function addClass (config) {
			if (config.selector) {
				var isTouchDevice = /MSIE 10.*Touch/.test(navigator.userAgent) || ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
					collection = $(config.selector),
					eventByDefault = isTouchDevice ? 'touchstart' : 'click',
					eventToBind = config.eventName || eventByDefault,
					classNameToAdd = config.classNameToAdd || 'active';

				collection.on(eventToBind, function (e) {
					if (eventToBind === 'click' || eventToBind === 'touchstart') {
						e.preventDefault();
					}

					if (config.removeOnOutsideClick) {
						e.stopPropagation();
					}
					var currentElement = config.parentToAddSelector ? $(this).closest(config.parentToAddSelector) : $(this);

					if (currentElement.hasClass(classNameToAdd)) {
						currentElement.removeClass(classNameToAdd);
					} else {
						currentElement.addClass(classNameToAdd);
					}
				});

				if (config.removeOnOutsideClick) {
					html.on(eventToBind, function (event) {
						if (collection.closest(config.parentToAddSelector)[0] != event.target && !collection.closest(config.parentToAddSelector).has(event.target).length) {
							collection.closest(config.parentToAddSelector).removeClass(classNameToAdd);
						}
					});
				}
			} else {
				console.log('You need to specify a selector for add class utility method');
			}
		}

		function limitCharacters (config) {
			var currentContainer = config.container,
				currentField = config.field,
				currentLimit = config.limit,
				currentProgressBar = config.progressbar,
				currentIndicator = config.indicator,
				currentFieldValue = currentField.val(),
				currentCharLength = currentFieldValue.length,
				errorClass = config.errorClass,
				preBlock = currentContainer.find('.pre').html(currentField.val().replace(/\r?\n/g,'<br>')),
				liheHeight = Math.round(preBlock.css('line-height').match(/(\+|-)?((\d+(\.\d+)?)|(\.\d+))/)[0]),
				itemHeight = preBlock.height(),
				diff = Math.round(itemHeight / liheHeight);

				win.on('load orientationchange', function () {
					config.field.trigger('keypress');
				});


			if (currentCharLength >= currentLimit) {
				currentContainer.addClass(errorClass);
				currentField.val(currentFieldValue.substr(0, currentLimit));
				currentIndicator.text(0);

				if (currentProgressBar && currentProgressBar.length) {
					currentProgressBar.css({ width: 0 });
				}
			} else {
				currentContainer.removeClass(errorClass);
				currentIndicator.text(currentLimit - currentCharLength);

				if (currentProgressBar && currentProgressBar.length) {
					currentProgressBar.css({ width: 100 - (currentCharLength / currentLimit * 100) + '%' });
				}
			}

			config.lineIndicator.text('').text(config.lineLimit - diff);
			config.field.on('keypress', function (e) {
				var preBlock = $(this).siblings('.pre').html($(this).val().replace(/\r?\n/g,'<br>')),
					liheHeight = Math.round(preBlock.css('line-height').match(/(\+|-)?((\d+(\.\d+)?)|(\.\d+))/)[0]),
					innerItemHeight = preBlock.height(),
					diff = Math.round(innerItemHeight / liheHeight);
				if (e.which === 13 && diff === config.lineLimit) {
					e.preventDefault();
					return false;
				} else {
					config.lineIndicator.text('').text(config.lineLimit - diff);
				}
			});
		}

		function charCount (config) {
			config = config || {};
			var charCountContainerSelector = config.charCountContainerSelector || '[data-char-count-container]',
				errorClass = config.errorClass || 'exceeding-limit';

			$(charCountContainerSelector).each(function () {
				var currentContainer = $(this),
					currentField = currentContainer.find('[data-char-count-field]'),
					currentProgressBar = currentContainer.find('[data-char-count-progress]'),
					currentLimit = parseInt(currentContainer.attr('data-char-limit'), 10),
					currentLineLimit = parseInt(currentContainer.attr('data-line-limit'), 10),
					currentIndicator = currentContainer.find('[data-char-count-number]'),
					currentLineIndicator = currentContainer.find('[data-line-count-number]');

				limitCharacters({
					container: currentContainer,
					errorClass: errorClass,
					field: currentField,
					indicator: currentIndicator,
					lineIndicator: currentLineIndicator,
					limit: currentLimit,
					lineLimit: currentLineLimit,
					progressbar: currentProgressBar
				});

				currentField.on('keyup', function () {
					limitCharacters({
						container: currentContainer,
						errorClass: errorClass,
						field: currentField,
						indicator: currentIndicator,
						lineIndicator: currentLineIndicator,
						limit: currentLimit,
						lineLimit: currentLineLimit,
						progressbar: currentProgressBar
					});
				});
			});
		}

		function calculateScrollWidth () {
			// block template for calculation
			var blockTemplate = $('<div><div style="height: 100px;"></div></div>').css({
				height: '50px',
				left: '200px',
				position: 'absolute',
				top: '100px',
				width: '50px'
			});

			body.append(blockTemplate);
			var firstWidth = $('div', blockTemplate).innerWidth();
			blockTemplate.css({
				'overflow-y': 'scroll'
			});
			var secondWidth = $('div', blockTemplate).innerWidth();
			scrollWidth = firstWidth - secondWidth;
			blockTemplate.remove();
		}

		function compensateScrollbarWidth () {
			containersCollection.each(function () {
				var currentContainer = $(this),
					currentPaddingRight = parseInt(currentContainer.css('padding-right'));
				currentContainer.css({
					'padding-right': currentPaddingRight + scrollWidth
				});
			});
		}

		function resetScrollbarWidth () {
			containersCollection.each(function () {
				$(this).css({
					'padding-right': ''
				});
			});

			header.css({
				'padding-right': ''
			});
		}

		return {
			addClass: addClass,
			charCount: charCount,
			limitCharacters: limitCharacters,
			calculateScrollWidth: calculateScrollWidth,
			compensateScrollbarWidth: compensateScrollbarWidth,
			resetScrollbarWidth: resetScrollbarWidth
		};
	}());

	window.utilities = utilities;
})(jQuery, window, window.document);
