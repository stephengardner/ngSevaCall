myApp.controller('headerController', ['Track', 'Nav', 'Request', '$rootScope', '$state', '$window', 'Menu', '$attrs',
	'$scope', function(Track, Nav, Request, $rootScope, $state, $window, Menu, $attrs, $scope){
		$scope.request = Request; // this might case a bug on iphones, please check
		$scope.$on("$stateChangeSuccess", function(event, state){
			// weird bug -- reading the "state.name" object in the partial for ng-show will cause this page to flash
			if(state.name == "step1")
				$("#nav").hide();
			else
				$("#nav").show();
		});
		$scope.navigation = Nav;
		$scope.nav = function(){
			if(Nav.direction == "forward") {
				Track.event(2, "forward_button_pressed", true);
				$rootScope.$broadcast('forward');
				$state.go("summary");
			}
			else {
				Track.event(2, "back_button_pressed", true);
				$rootScope.$broadcast('back');
				$window.history.back();
			}
		};
		$scope.menuToggle = function(){
			Menu.active = 1;
		};
	}])