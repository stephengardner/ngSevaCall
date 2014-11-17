myApp.controller('wrapperController', ['appStateTracker', '$appTutorial', '$scope', 'App', 'Storage', 'SCAPI', 'Categories', 'Track', '$rootScope', 'Request',
	'Nav', 'MapLoader', 'Location', 'User', '$location',
	function(appStateTracker, $appTutorial, $scope, App, Storage, SCAPI, Categories, Track, $rootScope, Request, Nav, MapLoader, Location, User, $location) {
		$scope.appStateTracker = appStateTracker;
		$scope.appTutorial = $appTutorial;
		$scope.app = App;
		$scope.categories = Categories;
		$scope.isPhoneGap = isPhoneGap;
		$scope.fakePhoneGap = false; // FAKING PHONE GAP FOR MOBILE TESTING

		var iphone4 = (window.screen.height == (960 / 2));
		var iphone5 = (window.screen.height == (1136 / 2));
		if(iphone4)
			$scope.iphone4 = true;
		else if(iphone5)
			$scope.iphone5 = true;

		function locate(opt_initial_check) {
			console.log("***locating....")
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