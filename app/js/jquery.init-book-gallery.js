(function ($, window, document, undefined, Modernizr) {
	'use strict';

	var configObject = {
		'activeClass': 'active',
		'altClass': 'alt-view',
		'dataSelectedCharacter': 'selectedCharacter',
		'dataCharacter': 'character',
		'letterRegExp': /^[qypgj]+$/,
		'frontCoverClass': 'at-front-cover',
		'rearCoverClass': 'at-rear-cover',
		'disabledClass': 'disabled',
		'breakpoint': 767,
		'scrollDelay': 400,
		'scrollingSpeed': 100,
		'isActiveClass': 'is-active',
		'isAnimatingClass': 'animating',
		'wasActiveClass': 'last-active'
	};

	var initBook = {
		init: function () {
			this.config = configObject;

			this.cache();

			Modernizr = window.Modernizr || { csstransforms3d: true };

			if (typeof Modernizr.preserve3d !== 'boolean') {
				Modernizr.preserve3d = true;
			}

			this.bindEvents();

			return this;
		},
		cache: function () {
			this.win = $(window);
			this.body = $('body');
			this.bookGallery = this.body.find('[data-book-gallery]');
			this.slidesetGallery = this.bookGallery.find('.bookblock');
			this.nextPage = this.bookGallery.find('.next');
			this.prevPage = this.bookGallery.find('.prev');
			this.bookItems = this.bookGallery.find('.bookblock-deploy');
			this.bookPager = this.bookGallery.find('.pager');
			this.bookPagerItems = this.bookGallery.find('li[data-selected-character]');
			this.coverImageLgSrc = [];
			this.coverImageSmSrc = [];
			this.coverImage = this.body.find('.visual .slideset img');

			this.isButtonClick = false;
			this.changeFlag = true;
			this.itemsOffset = {};
			this.turnFlag = false;
		},
		bindEvents: function () {
			var self = this;

			if (this.slidesetGallery.length) {
				if (this.win.width() > this.config.breakpoint) {
					this.changeFlag = true;
				} else {
					this.changeFlag = false;
				}

				this.bookPagerItems.each(function () {
					var cur = $(this),
						curLetter = cur.find('.letter').text();

					if (curLetter.match(self.config.letterRegExp)) {
						cur.addClass(self.config.altClass);
					}

				});
				this.cacheCoverImageUrls();

				this.setCoverImageSize();

				if (this.win.width() > this.config.breakpoint && this.changeFlag) {
					this.initBookGallery(this.slidesetGallery);
					this.initBookblock();
					this.bookGallery.addClass(this.config.frontCoverClass);
					this.changeFlag = false;
				}

				if (this.win.width() <= this.config.breakpoint && !this.changeFlag) {
					this.scrollBook();
					this.bookGallery.addClass(this.config.frontCoverClass);
					this.changeFlag = true;
				}
				this.win.on({
					'resize orientationchange': function () {
						// init jquery bookblock
						self.setCoverImageSize();
						if (self.win.width() > self.config.breakpoint && self.changeFlag) {
							self.initBookGallery(self.slidesetGallery);
							self.initBookblock();
							self.bookGallery.addClass(self.config.frontCoverClass);
							self.bookGallery.removeClass(self.config.rearCoverClass);
							self.changeFlag = false;
							self.nextPage.removeClass('disabled');
							self.prevPage.addClass('disabled');
						}
						else if (self.win.width() <= self.config.breakpoint && !self.changeFlag) {
							self.scrollBook();
							self.bookGallery.addClass(self.config.frontCoverClass);
							self.changeFlag = true;
						}
					}
				});
			}
		},
		cacheCoverImageUrls: function () {
			var i,
				curItem;
			for (i = 0; i < this.coverImage.length; i++) {
				curItem = this.coverImage[i];
				this.coverImageLgSrc.push($(curItem).data('lg-src'));
			}
			for (i = 0; i < this.coverImage.length; i++) {
				curItem = this.coverImage[i];
				this.coverImageSmSrc.push($(curItem).data('sm-src'));
			}
		},
		setCoverImageSize: function () {
			var windowWidth = parseInt(this.win.width(), 10),
				self = this;

			if (windowWidth >= self.config.breakpoint) {
				this.bookItems.each(function (i) {
					var cur = $(this).find('img');
					cur.prop('src', self.coverImageLgSrc[i]);
				});
			} else {
				this.bookItems.each(function (i) {
					var cur = $(this).find('img');
					cur.prop('src', self.coverImageSmSrc[i]);
				});
			}
		},
		setupGalleryItem: function (element) {

			element.find('.bookblock-deploy').each(function () {
				var curElement = $(this),
					pageEl = $('<div />').addClass('bookblock-item with-deploy').html(curElement.clone());
				curElement.after(pageEl);
				curElement.replaceWith(pageEl.clone());
			});
		},
		// function change activeClass gallery page
		changeActiveGalleryPage: function (element) {
			this.bookPagerItems.removeClass(this.config.activeClass);
			element.addClass(this.config.activeClass);
		},
		filterBookPagerItems: function (key) {
			var self = this;

			return self.bookPagerItems.filter(function () {
				return $(this).data(self.config.dataSelectedCharacter) === self.bookItems.eq(key).data(self.config.dataCharacter);
			});
		},
		calculateScroll: function (scroll) {
			var curScroll = scroll,
				key, nextElement, curPage;

			for (key in this.itemsOffset) {
				nextElement = parseInt(key, 10) + 1;

				if (this.itemsOffset[key] <= curScroll && this.itemsOffset[nextElement] > curScroll && this.itemsOffset[nextElement]) {
					this.bookItems.removeClass(this.config.activeClass).eq(key).addClass(this.config.activeClass);

					curPage = this.filterBookPagerItems(key);
					this.changeActiveGalleryPage(curPage);

					if (curPage.length) {
						this.bookPager.scrollLeft(curScroll / this.bookItems.length - curPage.outerWidth(true) - 150);
					}

				}
			}
		},
		// destroy gallery
		destroyGallery: function () {
			this.bookGallery.find('.bookblock-deploy').each(function (index) {
				var curElement = $(this);

				if (curElement.closest('.bookblock-item').length) {
					curElement.unwrap();

					if (index % 2 === 0) {
						curElement.remove();
					}
				}
			});
			this.bookGallery.find('.bookblock-overlay').remove();
			this.bookItems = this.bookGallery.find('.bookblock-deploy');
			this.prevPage.off('click');
			this.nextPage.off('click');
			this.bookPagerItems.find('button').off('click');
		},
		isOnScreen: function (element) {
			var viewport = {
					left: this.win.scrollLeft()
				},
				bounds = element.offset();
			bounds.left2 = bounds.left + 15 + element.outerWidth();

			viewport.right2 = viewport.left;
			viewport.right = viewport.left + this.win.width();
			bounds.right = bounds.left + element.outerWidth();

			return [(!(viewport.right2 > bounds.left || viewport.left > bounds.right) && !(viewport.right < bounds.left2 || viewport.left > bounds.right)), bounds.left];
		},
		onSheetSpin: function (element, elements) {
			var self = this,
				index = elements.pages.index(elements.itemTarget),
				visual = element.closest('.visual');

			if (!this.turnFlag) {
				this.bookPagerItems.each(function () {
					var cur = $(this);

					if (cur.data(self.config.dataSelectedCharacter) === elements.itemTarget.find('.bookblock-deploy').data(self.config.dataCharacter)) {
						self.changeActiveGalleryPage(cur);

						return true;
					}
				});
			}

			if (index) {
				visual.removeClass(this.config.frontCoverClass);
				this.nextPage.removeClass(this.config.disabledClass);
				this.prevPage.removeClass(this.config.disabledClass);
			} else {
				visual.addClass(this.config.frontCoverClass);
				this.nextPage.removeClass(this.config.disabledClass);
				this.prevPage.addClass(this.config.disabledClass);
			}

			if (index !== elements.pages.length - 2) {
				visual.removeClass(this.config.rearCoverClass);
			} else {
				visual.addClass(this.config.rearCoverClass);
				this.nextPage.addClass(this.config.disabledClass);
				this.prevPage.removeClass(this.config.disabledClass);
			}
		},
		spinSheet: function (element, direction) {
			var self = this,
				curItems = element.find('.bookblock-item'),
				curObj = {
					pages: curItems,
					itemActive: curItems.filter('.' + this.config.isActiveClass),
					itemAnimating: curItems.filter('.' + this.config.isAnimatingClass),
					itemNested: element.find('.bookblock-item, .bookblock-overlay'),
				},
				itemsNumber = {
					activeNext: curObj.itemActive.eq(1).index()
				},
				firstItem,
				lastItem = curItems.last().index() == itemsNumber.activeNext && direction == 'forwards';

			itemsNumber.activePrev = itemsNumber.activeNext - 1;
			firstItem = curItems.first().index() == itemsNumber.activePrev && direction == 'back';

			if (firstItem || lastItem) {
				return;
			}

			if (typeof direction == 'number') {
				//direction & 1
				itemsNumber.curNext = !(direction & 1) ? direction : direction + 1;
				itemsNumber.curPrev = itemsNumber.curNext - 1;

				if (itemsNumber.curPrev == itemsNumber.activePrev) {
					return;
				} else if (itemsNumber.curPrev > itemsNumber.activeNext) {
					direction = 'forwards';
					itemsNumber.target = itemsNumber.curPrev;
					itemsNumber.eqElement = itemsNumber.target + 1;
				} else {
					direction = 'back';
					itemsNumber.target = itemsNumber.curNext;
					itemsNumber.eqElement = itemsNumber.target - 1;
				}
			} else {
				if (direction == 'forwards') {
					itemsNumber.target = itemsNumber.activeNext + 1;
					itemsNumber.eqElement = itemsNumber.activeNext + 2;
				} else {
					itemsNumber.target = itemsNumber.activePrev - 1;
					itemsNumber.eqElement = itemsNumber.activePrev - 2;
				}
			}
			if (direction == 'back') {
				curObj.disabledPage = curObj.itemActive.first();
			} else {
				curObj.disabledPage = curObj.itemActive.last();
			}
			curObj.activePage = curObj.itemNested.eq(itemsNumber.target);
			curObj.itemTarget = curObj.activePage.add(curObj.itemNested.eq(itemsNumber.eqElement));
			curObj.itemAnimating = curObj.activePage.add(curObj.disabledPage);

			curObj.itemActive.removeClass(this.config.isActiveClass).addClass(this.config.wasActiveClass);
			curObj.itemTarget.addClass(this.config.isActiveClass);

			if ((Modernizr.csstransforms3d)) {
				curObj.itemAnimating.addClass(this.config.isAnimatingClass);
			}

			curObj.itemAnimating.on('webkitTransitionEnd oTransitionEnd msTransitionEnd transitionend', function () {
				curObj.itemAnimating.removeClass(self.config.isAnimatingClass);
				curObj.itemActive.removeClass(self.config.wasActiveClass);
			});

			this.onSheetSpin(element, curObj);
		},
		initHammer: function (right, left, holder) {
			if (typeof Hammer !== 'undefined') {

				right.hammer().bind('swipeleft', function () {
					this.spinSheet(holder, 'forwards');
				});

				left.hammer().bind('swiperight', function () {
					this.spinSheet(holder, 'back');
				});
			}
		},
		switchSheet: function (index, inc) {
			this.spinSheet(this.slidesetGallery, index * 2 + 2);
			index = index + inc;

			return index;
		},
		initBookblock: function () {
			var self = this;

			// destroy scroll action
			this.bookPagerItems.find('button').off('click');
			this.slidesetGallery.off('scroll');

			this.changeActiveGalleryPage(this.bookPagerItems.eq(0));
			this.spinSheet(this.slidesetGallery, 1);

			this.prevPage.add(this.nextPage).on({
				'click': function (event) {
					event.preventDefault();
				}
			});

			// click event gallery pager
			this.bookPagerItems.find('button').on({
				'click': function () {
					var curLi = $(this).closest('li'),
						curIndex = 0,
						i = 0,
						interval,
						activeIndex = $('.bookblock-item.' + self.config.isActiveClass).eq(1).index(),
						directionFlag;

					self.bookItems.each(function (index) {
						var cur = $(this);

						if (cur.data(self.config.dataCharacter) === curLi.data(self.config.dataSelectedCharacter)) {
							curIndex = index;

							return false;
						}
					});

					self.changeActiveGalleryPage(curLi);
					directionFlag = activeIndex < curIndex * 2 + 2 ? true : false;
					i = activeIndex / 2 - 1;
					self.turnFlag = true;

					interval = setInterval(function () {

						if (i == curIndex) {
							self.turnFlag = false;
						}

						if (directionFlag) {

							if (i <= curIndex) {
								i = self.switchSheet (i, 1);
							} else {
								clearInterval(interval);
							}
						} else {

							if (i >= curIndex) {
								i = self.switchSheet (i, -1);
							} else {
								clearInterval(interval);
							}
						}

					}, self.config.scrollingSpeed);
				}
			});
		},
		initBookGallery: function (element) {
			var self =this,
				curObj = {},
				overlayEl = $('<div />').addClass('bookblock-overlay'),
				curItems;

			element.addClass('loaded');
			this.setupGalleryItem(element);
			curItems = element.find('.bookblock-item');

			curObj = {
				itemPrev: curItems.filter(':nth-child(odd)'),
				itemNext: curItems.filter(':nth-child(even)')
			};

			element.prepend(overlayEl.clone());
			element.append(overlayEl.clone());
			curItems.eq(0).add(curItems.eq(1)).addClass(this.config.isActiveClass);

			curObj.itemPrev.add(this.prevPage).on({
				'click': function () {
					self.spinSheet(element, 'back');
				}
			});

			curObj.itemNext.add(this.nextPage).on({
				'click': function () {
					self.spinSheet(element, 'forwards');
				}
			});

			this.initHammer(curObj.itemNext, curObj.itemPrev, element);
		},
		scrollBook: function () {
			var self = this;

			// destroy gallery
			this.destroyGallery();

			// calculation offset
			setTimeout(function () {
				var slideIndex = 0;

				self.itemsOffset = {};

				self.slidesetGallery.scrollLeft(0);
				self.bookItems.each(function (index) {
					var cur = $(this);
					slideIndex = index;
					self.itemsOffset[slideIndex] = cur.offset().left + parseInt(cur.css('margin-left'), 10);
				});
				slideIndex = slideIndex + 1;
				self.itemsOffset[slideIndex] = self.slidesetGallery[0].scrollWidth - self.slidesetGallery[0].clientWidth;
				self.calculateScroll(self.slidesetGallery.scrollLeft());
			}, 100);

			// scroll event gallery
			this.slidesetGallery.on({
				'scroll': function () {
					if (!self.isButtonClick) {
						self.calculateScroll($(this).scrollLeft());
						self.bookGallery.removeClass(self.config.frontCoverClass);
					} else {
						setTimeout(function () {
							self.isButtonClick = false;
						}, self.config.scrollDelay);
					}

					if ($(this).scrollLeft() === 0) {
						self.bookGallery.addClass(self.config.frontCoverClass);
					} else {
						self.bookGallery.removeClass(self.config.frontCoverClass);
					}
				}
			});

			// click event gallery pager
			this.bookPagerItems.find('button').on({
				'click': function () {
					var curLi = $(this).closest('li'),
						result = self.isOnScreen(curLi);
					self.isButtonClick = true;
					self.bookGallery.removeClass(self.config.frontCoverClass);

					if (!result[0]) {
						self.bookPager.scrollLeft(result[1]);
					}

					if (curLi.data('selected-character') === self.bookPagerItems.eq(0).data('selected-character')) {
						self.bookGallery.addClass(self.config.frontCoverClass);
					} else {
						self.bookGallery.removeClass(self.config.frontCoverClass);
					}

					self.bookItems.each(function (index) {
						var cur = $(this);

						if (cur.data(self.config.dataCharacter) === curLi.data(self.config.dataSelectedCharacter)) {
							self.slidesetGallery.scrollLeft(self.itemsOffset[index]);

							return false;
						}
					});

					self.changeActiveGalleryPage(curLi);
				}
			});
		}
	};

	window.book = initBook.init();

})(jQuery, window, window.document);
