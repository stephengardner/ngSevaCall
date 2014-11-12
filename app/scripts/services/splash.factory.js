myApp.factory('Splash', ['$timeout', '$q', function($timeout, $q) {
	var Splash = {
		images : {
			iphone4 : 	'images/Default@2x~iphone.gif',
			iphone5 : 	'images/Default-568h@2x~iphone.gif',
			iPadPortrait : 	'images/Default-Portrait@2x~ipad.gif',
		},
		remove : function() {
			if(navigator.splashscreen) {
				//navigator.splashscreen.hide();
			}
            //using jquery animations.
            // in the future, we can opt to use angular's native $animate
            // however, jquery implementations are very straightforward
			$("#splashscreen").animate({
            	top : "-20px"
            }, 200, function(){
            	$("#splashscreen").animate({
            	top : "250%"
            	}, 500, function(){
                	$("#splashscreen").hide();
                });
            });
		},
		blip : function() {
			var deferred = $q.defer();
			var splash, blipImages;
			var index = 0;
			var self = this;
            /*
            if(device.name && device.name == "iPhone"){
            	if(window.devicePixelRatio == 1) {
                	this.setImage(this.images.iPhone4);
                }
                else {
                	this.setImage(this.images.iPhone5);
                }
            }
            if(device.name && device.name == "iPad"){
            	if(window.devicePixelRatio == 1) {
                
                }
                else {
                
                }
            }
            */
			if(device && device.platform == "iOS") {
				if(screen.height == 480) { // iphone 4 == 480
                	this.image = { src : this.images.iphone4 };
					splashImage = this.images.iphone4;
				}
				else if(screen.height == 568) {
                	this.image = { src : this.images.iphone5 };
					splashImage = this.images.iphone5;
				}
                else if(screen.height == 1024 && window.devicePixelRatio == 1) {
                	// ipad regular
                	this.image = { src : this.images.iPadPortrait };
					splashImage = this.images.iPadPortrait;
                }
                else if(screen.height == 1024 && window.devicePixelRatio == 2) {
                	// ipad regular
                	this.image = { src : this.images.iPadPortrait };
					splashImage = this.images.iPadPortrait;
                }
                $timeout(function(){
                	this.remove();
                }.bind(this), 1200);
				deferred.resolve(true);
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
