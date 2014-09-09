myApp.controller('menuController', ['$rootScope', '$parse', '$attrs', '$scope', 'Menu', 'Track', '$state',
	function($rootScope, $parse, $attrs, $scope, Menu, Track, $state){
		$scope.Menu = Menu;
		$rootScope.$on("click",function() {
			Menu.active = false;
		});
		$scope.click = function(button) {
			Track.event(2, button + "_button_pressed", true);
		};
	}])