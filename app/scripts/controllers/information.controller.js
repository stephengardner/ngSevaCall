// apologies for the amount of jQuery in the following controller, it is necessary for some things like adding a source to the iframe.  This wasn't doable in angular {{}} notation.  And event binding is a little easier here as well.
myApp.controller('informationController', ['Track', '$rootScope', 'Overlay', 'resolveSize', '$scope', '$window', 'Menu',
	'$state', function(Track, $rootScope, Overlay, resolveSize, $scope, $window, Menu, $state){
		// when the menu is no longer busy, append the vimeo video.
		// this gives the menu time to close before performing a graphic intensive task such as loading the vimeo player.
		// NOTE, VIMEO BUG: On the simulator, this video url is not playing.  The exact same code DOES play the vimeo example video.  So something is either wrong with how sevacall's video is accessed on the backend, or, I am clueless.
		var trackButton = function(type) {
			Track.event(2, type + "_button_pressed", true);
		};
		$scope.trackButton = trackButton;

		var addIframe = function() {
			if($state.current.name == "information") {
				$("#sc-video").removeClass("hidden");
			}
		}
		var addIframeOnTransitionEnd = function() {
			console.log("*Adding iFrame on transition end");
			if($(this).css("left") == "0px") {
				addIframe();
				$("#bodyContainer").unbind('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd',
					addIframeOnTransitionEnd);
			}
		};

		$("#bodyContainer").bind('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd',
			addIframeOnTransitionEnd);

		$scope.$on('$destroy', function() {
			$("#sc-video").addClass("hidden");
		});

		// when the info page is generated or the window is resized, fit the video perfectly into the page with no added
		// black borders.  Meaning is needs a 16/9 aspect ratio.  Calculate the width of the window and adjust the height
		// accordingly.
		function resizeVideo() {
			var width = $(".ui-view-container").width();
			var height = parseInt(( width / 16 ) * 9) + 2;
			$(".video-box").css({ "height": height + "px", "max-height" : "400px" });
			if(height < 400){
				$(".video-box").css({"width": "100%" });
			}
			else {
				height = 400;
				width = (height / 9) * 16;
				$(".video-box").css({"width": width + "px"});
			}
		}
		$(".video-box").css({"height" : resolveSize[0] + "px", "width" : resolveSize[1] + "px"});

		angular.element($window).bind('resize',function(){
			resizeVideo();
		});
	}])