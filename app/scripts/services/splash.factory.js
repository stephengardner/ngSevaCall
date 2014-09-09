myApp.factory('Splash', ['$q', function($q) {
	var Splash = {
		intervalLength : 400,
		image : {
			src : "images/splash-plain.png"
		},
		images : {
			iphone4 : 	[
				'images/splash-iphone4-1.jpg',
				'images/splash-iphone4-2.jpg',
				'images/splash-iphone4-3.jpg',
				'images/splash-iphone4-4.jpg'
			],
			iphone5 : 	[
				'images/splash-iphone5-1.jpg',
				'images/splash-iphone5-2.jpg',
				'images/splash-iphone5-3.jpg',
				'images/splash-iphone5-4.jpg'
			]
		},
		remove : function() {
			clearInterval(this.blipInterval);

			if(navigator.splashscreen) {
				navigator.splashscreen.hide();
			}

			$("#splashscreen").hide();
		},
		blip : function() {
			var deferred = $q.defer();
			var splash, blipImages;
			var index = 0;
			var self = this;
			if(device && device.platform == "iOS") {
				if(screen.height <= 480) { // iphone 4 == 480
					splash = document.getElementById("splashImg-iPhone4");
					blipImages = this.images.iphone4;
				}
				else {
					splash = document.getElementById("splashImg-iPhone5");
					blipImages = this.images.iphone5;
				}
				splash.style.left = 0;
				this.blipInterval = setInterval(function() {
					if( index == 0 ) {
						splash.src=blipImages[0];
						if(navigator.splashscreen)
							navigator.splashscreen.hide();
					}
					else if( index == blipImages.length ) {
						self.remove();
						deferred.resolve(true);
					}
					else {
						splash.src=blipImages[index];
					}
					index++;
				}, self.intervalLength);
			}
			else {
				navigator.splashscreen.hide();
				self.remove();
				deferred.resolve(true);
			}
			return deferred.promise;
		}
	};
	return Splash;

}]);
