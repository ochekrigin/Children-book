(function ($, window, document, undefined) {
	'use strict';

	var body = $('body'),
		previewForm = body.find('[data-role="preview-book"]'),
		previewErrors = {
			'type-1': previewForm.find('[data-error="type-1"]').eq(0).text(),
			'type-2': previewForm.find('[data-error="type-2"]').eq(0).text(),
			'type-3': previewForm.find('[data-error="type-3"]').eq(0).text()
		},
		maxCountLetters = parseInt(previewForm.find('[data-letters-limit-max]').data('lettersLimitMax'), 10),
		minCountLetters = parseInt(previewForm.find('[data-letters-limit-min]').data('lettersLimitMin'), 10),
		errorElement = $('<ul class="error-list"><li></li></ul>');

	if (previewForm.length) {
		previewForm.find('[data-role="submit-name"]').on({
			'click': function () {
				var cur = $(this),
					curForm = cur.closest('[data-role="preview-book"]'),
					input = curForm.find('[data-role="name"]'),
					error = '',
					childName = curForm.find('[data-role="name"]').val(),
					nameLetters = childName.toLowerCase(),
					letterTrack = '',
					errorClass = 'error',
					genericStory = 0,
					letter,
					occurs, i;

				previewForm.find('.error-list').remove();


				if (childName.length < minCountLetters || childName.length > maxCountLetters || childName.indexOf(' ') === 0 || childName.match(/\\d+\\.?\\d*/g) !== null || !/^[a-zA-Z-' ]*$/.test(childName)) {
					error = previewErrors['type-1'];
					input.addClass(errorClass);
					if (curForm.find('.data-box').length) {
						curForm.find('.data-box').addClass(errorClass);
					}
				} else if (!curForm.find('[data-role="boy"]:checked').length && !curForm.find('[data-role="girl"]:checked').length) {
					error = previewErrors['type-2'];
					curForm.find('.radio-list').addClass(errorClass);
					input.removeClass(errorClass);
					if (curForm.find('.data-box').length) {
						curForm.find('.data-box').removeClass(errorClass);
					}
				} else {
					input.removeClass(errorClass);
					if (curForm.find('.data-box').length) {
						curForm.find('.data-box').removeClass(errorClass);
					}
				}

				for (i = 0; i < nameLetters.length; i++) {
					letter = nameLetters[i];
					occurs = letterTrack.split(letter).length - 1;

					if (occurs > 0 && ('ae'.indexOf(letter) === -1 || occurs != 1)) {
						genericStory = genericStory + 1;

						if (genericStory > 3) {
							error = previewErrors['type-3'];
							input.addClass(errorClass);
							curForm.find('.radio-list').removeClass(errorClass);
						} else {
							if (childName.indexOf(' ') !== 0 && childName.match(/\d+/g) === null && /^[a-zA-Z-' ]*$/.test(childName) && childName.length >= minCountLetters && childName.length <= maxCountLetters) {
								input.removeClass(errorClass);
							}
						}
					}

					letterTrack = letterTrack + letter;
				}

				if (error) {
					errorElement.clone().find('li').text(error).end().appendTo(previewForm);

					return false;
				}
			}
		});
	}

})(jQuery, window, window.document);
