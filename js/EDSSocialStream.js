(function ($) {
	$.fn.edsSocialStreamLoader = function (settings) {
		return this.each(function (i, el) {
			var startingArticle = settings.startingArticle,
				$this = $(el),
				$window = $(window),
				$document = $(document),
				$allCache = $('.edSocialStream__streamListWrapper', $this).clone(),
				requestInProgress = false,
				allPostsLoaded = false,
				getMoreArticles = function (providerType, startPost) {

					if (requestInProgress || allPostsLoaded)
						return false;
					let localStartPost = startingArticle;

					requestInProgress = true;

					if (providerType != "all")
						localStartPost = startPost;

					$.ajax({
						url: settings.sourceUrl,
						data: $.extend({}, settings.params, { startingArticle: localStartPost, providerType: providerType }),
						dataType: 'json',
						success: function (response) {

							var $newItems = $(response.returnData.html),
								isotopeItems = [];

							if (providerType == "all") {
								// $grid.append($newItems)
								// 	// add and lay out newly appended elements
								// 	.eds_isotope('appended', $newItems);
								$newItems.each(function () {
									var item = this;
									isotopeItems.push(item);
									$('.edssm__grid', $this).append(item);
								});

								$('.edssm__grid', $this).eds_isotope('insert', isotopeItems);

								startingArticle = startingArticle + settings.numberOfPostsperPage;

								if (startingArticle >= settings.totalPosts) {
									allPostsLoaded = true;
									$('.edssm__loadMoreTriggerWrapper', $this).css("display", "none");
								}
							}
							else {
								if (localStartPost == 0) {
									//$('.edssm__grid', $this).eds_isotope('destroy');
									var $testel = $('.edSocialStream__streamListWrapper', $this).clone();
									$testel.empty();
									$testel.append($newItems);
									$('.edSocialStream__streamListWrapper', $this).replaceWith($testel.clone());
								}
								else {
									$newItems.each(function () {
										var item = this;
										isotopeItems.push(item);
										$('.edssm__grid', $this).append(item);
									});

									$('.edssm__grid', $this).eds_isotope('insert', isotopeItems);

								}
								localStartPost = localStartPost + settings.numberOfPostsperPage;

								if (localStartPost >= response.returnData.totalCount) {
									$('.edssm__loadMoreTriggerWrapper', $this).css("display", "none");
								}
								else {
									$('.edssm__loadMoreTriggerWrapper', $this).css("display", "block");
								}

								let $clickedProvider = $('[data-provider="' + providerType + '"]', $this);
								$clickedProvider.data("start", localStartPost);

							}
						},
						complete: function () {

							requestInProgress = false;
							$('.edssm__loadMorePosts', $this).removeClass('loading');

							if (providerType == "all") {
								$allCache = $('.edSocialStream__streamListWrapper', $this).clone();
								masonryInit();
								adminInit();
							}
							else {
								masonryInit();
								adminInit();
							}

						}
					});

					return true;
				}

			adminInit = function () {
				if (settings.iseditor) {
					$('.edSocialStream__visibleAction', $this).on('click', function (event) {
						var $eds_checkBox = $(this);
						$.ajax({
							url: settings.activeSourceUrl,
							data: $.extend({}, settings.params, { id: event.target.id, checkedState: $eds_checkBox.prop("checked") }),
							dataType: 'json',
							success: function (response) {
								if ($eds_checkBox.prop("checked"))
									$eds_checkBox.closest('.edSocialStream_streamItem').removeClass('edSocialStream__notVisible')
								else
									$eds_checkBox.closest('.edSocialStream_streamItem').addClass('edSocialStream__notVisible')
							},
							complete: function () {

								requestInProgress = false;

							}
						});
					});

					$('.edSocialStream__pinnedAction', $this).on('click', function (event) {

						if (requestInProgress == true)
							return;
						requestInProgress = true;
						var $eds_checkBox = $(this);
						
						$.ajax({
							url: settings.pinnedSourceUrl,
							data: $.extend({}, settings.params, { id: event.target.id, checkedState: $eds_checkBox.prop("checked") }),
							dataType: 'json',
							success: function (response) {
								if ($eds_checkBox.prop("checked"))
									$eds_checkBox.closest('.edSocialStream_streamItem').addClass('edSocialStream__pinned')
								else
									$eds_checkBox.closest('.edSocialStream_streamItem').removeClass('edSocialStream__pinned')
							},
							complete: function () {

								requestInProgress = false;

							}
						});
					});

					$('.edSocialStream__deleteAction', $this).on('click', function (event) {
						if (confirm(settings.AreYouSureLoc)) {
							var $eds_checkBox = $(this);
							$.ajax({
								url: settings.deleteSourceUrl,
								data: $.extend({}, settings.params, { id: event.target.id, checkedState: true }),
								dataType: 'json',
								success: function (response) {
									$eds_checkBox.closest('.edSocialStream_streamItem').addClass('edSocialStream__deleted')
								},
								complete: function () {

									requestInProgress = false;

								}
							});
						}
					});
				}
			}

			masonryInit = function () {
				$('.edssm__grid', $this)
					.eds_isotope({
						itemSelector: '.element-item',
						sortBy: 'original-order',
						masonry: {
							isFitWidth: true,
							isHorizontal: true
						}
					})
					.find('img').imagesLoaded()
					.progress(function () {
						$('.edssm__grid', $this).eds_isotope('layout');
					});
			}

			$('.edssm__grid', $this).eds_isotope({
				itemSelector: '.element-item',
				layoutMode: 'masonry',
				sortBy: 'original-order',
				masonry: {
					fitWidth: true,
					isHorizontal: true
				}
			});

			masonryInit();
			adminInit();

			$('.edSocialStream_menuItem', $this).on('click', function (event) {
				event.preventDefault();
				var $clickedProvider = $(this);
				if ($clickedProvider.hasClass('edSocialStream_active') || requestInProgress)
					return false;
				else {
					$('.edSocialStream_menuItem', $this).each(function (index) {
						$(this).removeClass('edSocialStream_active');
					});
					$clickedProvider.addClass('edSocialStream_active');
					let dataProvider = "all";
					let startPost = "0";

					dataProvider = $clickedProvider.data("provider");
					startPost = $clickedProvider.data("start");

					$('.edSocialStream_menuItem', $this).each(function (index) {
						$(this).data("start", 0);
					});

					if (dataProvider == "all") {
						$('.edSocialStream__streamListWrapper', $this).replaceWith($allCache.clone());
						if (startingArticle < settings.totalPosts) {

							$('.edssm__loadMoreTriggerWrapper', $this).css("display", "block");
						}
						masonryInit();
						adminInit();
					}
					else {
						getMoreArticles(dataProvider, startPost, $clickedProvider);
					}
					return false;
				}
			});

			$('.edssm__loadMorePosts', $this).on('click', function () {
				let $loadMore = $(this);
				let dataProvider = "all";
				let startPost = "0";
				let $activeProvider = $('.edSocialStream_active', $this);
				if ($activeProvider.length > 0) {
					dataProvider = $activeProvider.data("provider");
					startPost = $activeProvider.data("start");
				}
				$loadMore.addClass('loading');
				getMoreArticles(dataProvider, startPost)
				//if (getMoreArticles(dataProvider))
				return false;
			});

			if (settings.triggerOnScroll) {
				$window.scroll(function () {
					var pixelsToBottom = $document.height() - $window.scrollTop() - $window.height();

					if (pixelsToBottom < 1000) {
						let dataProvider = "all";
						let startPost = "0";
						let $activeProvider = $('.edSocialStream_active', $this);
						if ($activeProvider.length > 0) {
							dataProvider = $activeProvider.data("provider");
							startPost = $activeProvider.data("start");
						}
						$('.edssm__loadMorePosts', $this).addClass('loading');
						getMoreArticles(dataProvider, startPost)
						//$triggerWrapper.addClass('loading');
					}
				});
			}

		});
	};
})($);
