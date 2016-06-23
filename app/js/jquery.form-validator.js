/*--- jQuery Form Validator ---*/
;(function(){
	"use strict";

	var dataName = 'FormValidator',
		arrNames = ['bindScope', 'getUI', 'checkItems'];

	function FormValidator(thisDOMObj, config){
		this.dataItem = jQuery(thisDOMObj);
		if (typeof config !== 'string' && !this.dataItem.data(dataName)) { // init custom form
			// default options
			this.options = jQuery.extend({
				items: 'input[type="text"], input[type="email"], input[type="tel"], input[type="password"], textarea', // validate items
				errorClass: 'error', // error class
				successClass: 'success', // success class
				validAttr: 'type', // attribute for type of regulation exemptions
				regExp: {
					text: /^/,
					email: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
					tel: /^[0-9\+\ \-]+$/
				}, // type of regulation exemptions
				defaultExp: 'text', // default name type of regulation exemptions
				minLength: 3, // min length of value in items
				addClassAt: false, // filter for parent of validate items
				onlyFocused: false, // validate only focused item
				eventObj: false, // event object item
				event: 'submit', // event type
				preventDefault: true, // prevent default when validation not passed
				beforeValid: null, // before check validation callback
				afterValid: null, // after check validation callback
				addValidFunc: function(){
					return true;
				}, // add custom validate function, must return boolean varible, element - checking item
				onSubmit: null, // on submit callback
				onInit: null // on init plugin callback
			}, config);

			this.init();
		}
		return this;
	}

	FormValidator.prototype = {
		// init function
		init: function(){
			if (this.dataItem.data(dataName)) {
				return;
			}
			// add api in data form
			this.dataItem.data(dataName, this);

			this.createElements();
			this.attachEvents();

			// init callback
			if (typeof this.options.onInit === 'function') {
				this.bindScope(this.options.onInit)(this.getUI());
			}
		},
		getUI: function(){
			return {
				form: this.dataItem,
				errorItems: this.errorItems,
				successItems: this.successItems,
				passValid: this.passValid
			};
		},
		// attach events and listeners
		attachEvents: function(){
			this.eventHandler = this.bindScope(function(event){
				// before validation callback
				if (typeof this.options.beforeValid === 'function') {
					this.bindScope(this.options.beforeValid)(event, this.getUI());
				}

				if (this.options.preventDefault && event.type === 'submit') {
					this.checkItems();
				} else if (this.items.filter(event.currentTarget).length) {
					this.checkItems(this.options.onlyFocused ? event.currentTarget : false);
				} else {
					this.checkItems();
				}

				if (!this.passValid && this.options.preventDefault && event.type === 'submit') {
					event.preventDefault();
				}

				// after validation callback
				if (typeof this.options.afterValid === 'function') {
					this.bindScope(this.options.afterValid)(event, this.getUI());
				}

				// on submit callback
				if (typeof this.options.onSubmit === 'function' && event.type === 'submit') {
					this.bindScope(this.options.onSubmit)(event, this.getUI());
				}
			});

			if (this.options.eventObj) {
				this.eventObj.on(this.options.event, this.eventHandler);
				this.dataItem.on('submit', this.eventHandler);
			} else {
				this.dataItem.on(this.options.event, this.eventHandler);
			}
		},
		// create api elements
		createElements: function(){
			this.successItems = jQuery();
			this.errorItems = jQuery();
			if (this.options.eventObj) {
				this.eventObj = this.dataItem.find(this.options.eventObj);
			}
			if (this.options.addClassAt) {
				this.addAtItems = this.dataItem.find(this.options.addClassAt);
			}
			this.items = this.dataItem.find(this.options.items);
			this.passValid = false;
		},
		// api update function
		update: function(){
			this.items.removeClass(this.options.errorClass + ' ' + this.options.successClass);
			if (this.options.eventObj) {
				this.eventObj.off(this.options.event, this.eventHandler);
			} else {
				this.dataItem.off(this.options.event, this.eventHandler);
			}

			this.createElements();
			this.attachEvents();

			// init callback
			if (typeof this.options.onInit === 'function') {
				this.bindScope(this.options.onInit)(this.getUI(), true);
			}
		},
		refreshState: function(){
			if (this.options.addClassAt) {
				this.errorItems.each(this.bindScope(function(index, thisItem){
					this.addAtItems.has(thisItem).removeClass(this.options.successClass).addClass(this.options.errorClass);
				}));
				this.successItems.each(this.bindScope(function(index, thisItem){
					this.addAtItems.has(thisItem).removeClass(this.options.errorClass).addClass(this.options.successClass);
				}));
			} else {
				this.errorItems.removeClass(this.options.successClass).addClass(this.options.errorClass);
				this.successItems.removeClass(this.options.errorClass).addClass(this.options.successClass);
			}
		},
		checkItems: function(item){
			if (!item) {
				this.successItems = this.items.filter(this.bindScope(function(index, thisItem){
					var curType = thisItem.getAttribute(this.options.validAttr);
					if (thisItem.value.length >= this.options.minLength) {
						if (this.options.regExp[curType] && curType !== this.options.defaultExp) {
							return this.options.regExp[curType].test(thisItem.value) && this.options.addValidFunc(thisItem, this.getUI());
						} else if (this.options.regExp[this.options.defaultExp]) {
							return this.options.regExp[this.options.defaultExp].test(thisItem.value) && this.options.addValidFunc(thisItem, this.getUI());
						}
					} else {
						return false;
					}
				}));
				this.errorItems = this.items.not(this.successItems);
				this.refreshState(item);
				this.passValid = this.errorItems.length ? false : true;
			} else {
				this.passValid = jQuery(item).addClass(this.options.errorClass).removeClass(this.options.successClass).filter(this.bindScope(function(index, thisItem){
					var curType = thisItem.getAttribute(this.options.validAttr);
					if (thisItem.value && thisItem.value.length >= this.options.minLength) {
						if (this.options.regExp[curType] && curType !== this.options.defaultExp) {
							return this.options.regExp[curType].test(thisItem.value) && this.options.addValidFunc(thisItem, this.getUI());
						} else if (this.options.regExp[this.options.defaultExp]) {
							return this.options.regExp[this.options.defaultExp].test(thisItem.value) && this.options.addValidFunc(thisItem, this.getUI());
						}
					} else {
						return false;
					}
				})).addClass(this.options.successClass).removeClass(this.options.errorClass).length ? false : true;
			}
			return this.passValid;
		},
		// api destroy function
		destroy: function(){
			this.items.removeClass(this.options.errorClass + ' ' + this.options.successClass);
			if (this.options.eventObj) {
				this.eventObj.off(this.options.event, this.eventHandler);
				this.dataItem.off('submit', this.eventHandler);
			} else {
				this.dataItem.off(this.options.event, this.eventHandler);
			}
			this.dataItem.removeData(dataName);
		},
		bindScope: function(func, scope){
			return jQuery.proxy(func, scope || this);
		}
	};

	jQuery.fn.formValidator = function(config, param){
		var tempData = {};
		if (!this.length) {
			return this;
		} else if (typeof config === 'string') {
			for (var i = 0; i < arrNames.length; i++) {
				if (arrNames[i] === config) {
					tempData = true;
				}
			}
			if (tempData === true) {
				tempData = this.eq(0).data(dataName);
				if (typeof tempData[config] === 'function') {
					return tempData[config](param) || this;
				} else if (tempData[config]) {
					return tempData[config];
				} else {
					return this;
				}
			} else if (typeof FormValidator.prototype[config] === 'function') {
				return this.each(function(){
					var curData = jQuery(this).data(dataName);
					if (curData) {
						curData[config](param);
					}
				});
			} else if (FormValidator.prototype[config]) {
				return this.eq(0).data(dataName)[config];
			} else {
				return this;
			}
		} else {
			return this.each(function(){
				new FormValidator(this, config);
			});
		}
	};

}(jQuery));