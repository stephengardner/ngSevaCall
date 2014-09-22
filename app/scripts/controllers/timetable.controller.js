myApp.controller('timeTableController', ['appStateTracker', 'Times', '$scope', '$rootScope',
	function(appStateTracker, Times, $scope, $rootScope){
		$scope.appStateTracker = appStateTracker;
	$scope.Times = Times;
	console.log("*Times object:" + Times.postify());
	var tempTimes = angular.copy(Times.timesActive);
	var cleanUpFunction = $rootScope.$on('back', function(){
		Times.timesActive = tempTimes;
	});
	$scope.$on('$destroy', function() {
		cleanUpFunction();
	});
	$scope.$on('ngRepeatFinished', function(){
		$scope.appStateTracker.pageLoaded = "timetable";
	});
}])