myApp.controller('actionButtonController', ['$scope', 'Track', function($scope,  Track){
	$scope.click = function(text){
		Track.event(2, text + "_button_pressed", true);
	};
}])