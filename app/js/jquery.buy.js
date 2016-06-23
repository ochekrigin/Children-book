(function ($, window, document, undefined) {
	'use strict';

	/* jshint ignore:start */
	var body = $('body'),
		btnBack = body.find('#id_submit_back'),
		paymentForm = body.find('#payment-form'),
		btnSubmit = paymentForm.find('#submitBtn'),
		messageError = paymentForm.find('#payment-errors'),
		errorClass = 'warninng';

	// function handles the Stripe response:
	function stripeResponseHandler(status, response) {
		var paymentForm = $("#payment-form");
		// check for an error:
		if (response.error) {
			reportError(response.error.message);
		} else {
		  var token = response['id'];
		  // insert the token into the form so it gets submitted to the server
		  paymentForm.append("<input type='hidden' name='stripeToken' value='" + token + "' />");
		  // submit the form:
		  paymentForm.get(0).submit();

		}
		
	}

	function reportError(msg) {
		// show the error in the form:
		messageError.text(msg).addClass('message-error');
		// re-enable the submit button:
		btnSubmit.prop('disabled', false);
		return false;
	}

	btnBack.on('click', function (e) {
		e.preventDefault();
		window.location.replace('/basket/');
	});

	paymentForm.on('submit', function (e) {
		var currentForm = $(this),
			error = false,
			ccNum = currentForm.find('#id_card_number'),
			ccNumValue = ccNum.val(),
			cvcNum = currentForm.find('#id_card_cvc'),
			cvcNumValue = cvcNum.val(),
			expMonth = currentForm.find('#id_card_expiry_month'),
			expMonthValue = expMonth.val(),
			expYear = currentForm.find('#id_card_expiry_year'),
			expYearValue = expYear.val();

		// disable the submit button to prevent repeated clicks:
		btnSubmit.attr("disabled", "disabled");

		// validate card
		if (!Stripe.validateCardNumber(ccNumValue) || ccNumValue.length < 14 || ccNumValue.length > 16 || isNaN(ccNumValue)) {
			error = true;
			reportError('The credit card number appears to be invalid.');
			ccNum.closest('.form-control').addClass(errorClass);
			expMonth.closest('.form-control').removeClass(errorClass);
			expYear.closest('.form-control').removeClass(errorClass);
			cvcNum.closest('.form-control').removeClass(errorClass);
		} else if (!Stripe.validateExpiry(expMonthValue, expYearValue) || expMonthValue.length !== 2 || parseInt(expMonthValue) >= 13 || expYearValue.length !== 4 || isNaN(expMonthValue) || isNaN(expYearValue)) {
			expMonth.closest('.form-control').addClass(errorClass);
			expYear.closest('.form-control').addClass(errorClass);
			cvcNum.closest('.form-control').removeClass(errorClass);
			// if (expMonthValue.length === 2 && !isNaN(expMonthValue) && parseInt(expMonthValue) < 13) {
			// 	expMonth.closest('.form-control').removeClass(errorClass);
			// }
			// if (expYearValue.length === 4 && !isNaN(expYearValue) && Stripe.validateExpiry(expMonthValue, expYearValue)) {
			// 	expYear.closest('.form-control').removeClass(errorClass);
			// }
			error = true;
			reportError('The expiration date appears to be invalid.');
			ccNum.closest('.form-control').removeClass(errorClass);
		} else if (!Stripe.validateCVC(cvcNumValue) || cvcNumValue.length !== 3 || isNaN(cvcNumValue)) {
			error = true;
			reportError('The security code appears to be invalid.');
			cvcNum.closest('.form-control').addClass(errorClass);
			expMonth.closest('.form-control').removeClass(errorClass);
			expYear.closest('.form-control').removeClass(errorClass);
		}

		// validate other form elements, if needed!
		
		// check for errors:
		if (!error) {
			cvcNum.closest('.form-control').removeClass(errorClass);
			
			// get the Stripe token:
			Stripe.createToken({
				number: ccNumValue,
				cvc: cvcNumValue,
				exp_month: expMonthValue,
				exp_year: expYearValue
			}, stripeResponseHandler);

		}

		return false;
	});
	/* jshint ignore:end */

})(jQuery, window, window.document);
