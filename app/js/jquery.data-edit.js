(function ($, window, document, undefined) {
	'use strict';

	
	/* jshint ignore:start */
	var body = $('body'),
		dataForm = body.find('[data-form]'),
		messageForm = body.find('[data-edit-book]'),
		infoPopup = body.find('#welcome-lightbox'),
		btnRemove = dataForm.find('[data-remove]');

	if (btnRemove.length) {
		btnRemove.on('click', function (e) {
			if (!window.confirm('Are you sure you wish to remove this item from your basket?')) {
				e.preventDefault();
			}
		});
	}

	if (dataForm.length && messageForm.length) {

		var editPopupLink = dataForm.find('[data-edit-popup]'),
			globalRadioList = messageForm.find('[data-gender-list]'),
			globalRadioListCollection = globalRadioList.find('input[type="radio"]'),
			dataObj = {},
			newMessage, element, currentMessage, currentTextarea, titleBook, currentGender, currentImgHolder, giftType, dataItemUrl, csrf, errorBox;

		editPopupLink.on('click', function (e) {
			e.preventDefault();

			var current = $(this),
				currentPopup = $(current.attr('href')),
				radioList = currentPopup.find('[data-gender-list]'),
				labelCollection = radioList.find('label'),
				radioCollection = radioList.find('input[type="radio"]'),
				currentParent = current.closest('.product-item');
			errorBox = currentPopup.find('.error-box');
			titleBook = currentParent.find('[data-user-name]');
			currentGender = currentParent.find('[data-title-gender]').find('[data-text]');
			currentImgHolder = currentParent.find('.img-holder');
			element = currentParent.find('.message-update');
			newMessage = currentParent.siblings('[data-type="hidden"]');
			currentTextarea = currentPopup.find('textarea');
			currentMessage = currentTextarea.val('').val(newMessage.val());
			dataItemUrl = current.data('request-url');
			if (currentParent.find('[data-gift-item]').length && currentParent.find('[data-gift-item]').text().length >= 1 && !currentParent.find('[data-gift-item]').hasClass('hidden')) {
				currentPopup.find('[data-gift="true"]').prop('checked', true);
			} else {
				currentPopup.find('[data-gift="false"]').prop('checked', true);
			}

			labelCollection.each( function () {
				var current = $(this);

				if (current.html() === currentGender.html()) {
					radioCollection.prop('checked', false);
					current.siblings('input[type="radio"]').prop('checked', true);
				}
			});

			currentPopup.find('input[type="text"]').val(titleBook.html());
		});

		messageForm.find('button[type="submit"]').on('click', function (e) {
			e.preventDefault();

			var currentPopup = $(this).closest('.lightbox'),
				currentPopupInput = currentPopup.find('input[type="text"]'),
				radioCollection = currentPopup.find('[data-gender-list]').find('input[type="radio"]'),
				giftRadioCollection = currentPopup.find('[data-gift]'),
				currentDataBox = currentPopup.find('.data-box'),
				checkedRadio;

			radioCollection.each( function () {
				if ($(this).prop('checked') === true) {
					checkedRadio = $(this).siblings('label').html();
				}
			});

			if (dataForm.find('input[type="hidden"]').prop('name') === 'csrfmiddlewaretoken') {
				csrf = dataForm.find('input[type="hidden"]').val();
			}

			giftRadioCollection.each( function () {
				if ($(this).prop('checked') === true) {
					giftType = $(this).data('gift');

					if ($(this).data('gift') === true) {
						if (currentGender.siblings('[data-gift-item]').length >= 4) {
							currentGender.siblings('[data-gift-item]').removeClass('hidden');
						} else {
							currentGender.siblings('[data-gift-item]').html(' + gift wrap').removeClass('hidden');
						}
					} else {
						currentGender.siblings('[data-gift-item]').addClass('hidden');
					}
				}
			});

			dataObj = {
				uid: titleBook.closest('[data-unique-id]').data('unique-id'),
				child_name: currentPopupInput.val(),
				child_gender: checkedRadio.toLowerCase(),
				book_message: currentTextarea.val(),
				giftwrap: giftType
			};
			$.ajax({
			  type: 'POST',
			  url: dataItemUrl,
			  dataType: 'json',
			  data: dataObj,
			  success: function (data) {
			  	if (data.status === 'Error') {
			  		errorBox.empty();
			  		for (var prop in data.errors) {
			  			errorBox.append('<p class="red">' + data.errors[prop] + '</p>');
			  		}
			  	} else {

					if (currentPopupInput.val() !== titleBook.html() || checkedRadio !== currentGender.html()) {
						titleBook.html(currentPopupInput.val());
						currentGender.html(checkedRadio);
						currentImgHolder.attr('data-gender', checkedRadio.toLowerCase());
						if (!currentDataBox.hasClass('error')) {
							$.fancybox.close();
							if (infoPopup.length) {
								// $.fancybox.open(infoPopup);
								errorBox.empty();
								location.reload();
							}
						}
					}

					if (currentTextarea.val() !== newMessage.val()) {
						element.removeClass('hidden');
						newMessage.val(currentTextarea.val());
						currentMessage = currentTextarea.val();
						if (!currentDataBox.hasClass('error')) {
							$.fancybox.close();
							if (infoPopup.length) {
								// $.fancybox.open(infoPopup);
								errorBox.empty();
								location.reload();
							}
						}
					} else {
						if (!currentDataBox.hasClass('error')) {
							$.fancybox.close();
							if (infoPopup.length) {
								// $.fancybox.open(infoPopup);
								errorBox.empty();
								location.reload();
							}
						}
					}
			  	}
			  }
			});
		});

		globalRadioListCollection.on('change', function () {
			var currentItem = $(this);

			if (currentItem.prop('checked', false)) {
				globalRadioListCollection.attr('checked', false);
				currentItem.prop('checked', true);
			}
		});
	}
	/* jshint ignore:end */
	

})(jQuery, window, window.document);
