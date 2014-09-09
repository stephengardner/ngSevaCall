myApp.controller('wrapperController', ['$scope', 'App', 'Storage', 'SCAPI', 'Categories', 'Track', '$rootScope', 'Request',
	'Nav', 'MapLoader', 'Location', 'User', '$location',
	function($scope, App, Storage, SCAPI, Categories, Track, $rootScope, Request, Nav, MapLoader, Location, User, $location) {
		$scope.app = App;
		Storage.import();
		SCAPI.init(Request);
		$scope.categories = Categories;

		// Initialize the analytics tracker and log app opening
		Track.init();
		Track.event(1, "application_opened");

		// Track each page opening as it occurs
		$rootScope.$on('$locationChangeSuccess', function(){
			console.log("*page*" + $location.url());
			Track.event(1, $location.url().replace("/", "") + "_screen_opened");
			// only call if the event.preventDefault isn't active from the locationChangeStart
			Nav.reset();
		});

		$scope.isPhoneGap = isPhoneGap;
		var iphone4 = (window.screen.height == (960 / 2));
		var iphone5 = (window.screen.height == (1136 / 2));
		if(iphone4)
			$scope.iphone4 = true;
		else if(iphone5)
			$scope.iphone5 = true;


		function locate(opt_initial_check) {
			console.log("***locating....");
			MapLoader.loadMaps().then(function(){
				if(!User.zipcode) {
					console.log("*Going to geoLocate from wrapperController");
					Location.geoLocate(opt_initial_check).then(function(d){
						User.setZipcode(d);
					});
				}
			});
		}
		locate(1);
	}]);