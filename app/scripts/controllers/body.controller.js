myApp.controller('bodyController', ['$location', '$scope', 'Menu', 'AnimationService',
	function($location, $scope, Menu, AnimationService){

		if(testingType == "statusBug") {
			$location.path("/statusBug");
		}
		else {
			$location.path("/step1");
		}
		$scope.menu = Menu;
		$scope.click = function($event) {
			Menu.active = false;
		};
		$scope.animationService = AnimationService;
	}])