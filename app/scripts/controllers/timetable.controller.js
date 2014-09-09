myApp.controller('timeTableController', ['Times', '$scope', '$rootScope', function(Times, $scope, $rootScope){
	$scope.Times = Times;
	console.log("*Times object:" + Times.postify());
	var tempTimes = angular.copy(Times.timesActive);
	var cleanUpFunction = $rootScope.$on('back', function(){
		Times.timesActive = tempTimes;
	});
	$scope.$on('$destroy', function() {
		cleanUpFunction();
	});
}])