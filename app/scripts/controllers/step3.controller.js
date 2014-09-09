myApp.controller('step3Controller', ['$urlRouter', '$rootScope', '$state', 'Nav', 'GoogleMap', 'Request', '$scope', function($urlRouter, $rootScope, $state, Nav, GoogleMap, Request, $scope){
	var cleanUpFunction = $rootScope.$on('$stateChangeStart', function(event, toState){
		function alertOnChange() {
			event.preventDefault();
			Request.alert = new xAlert(alerts.abandon.body,
				function(button) {
					if(button == 1){
						Request.reset();
						cleanUpFunction();
						$state.go(toState.name);
						$urlRouter.sync(); // not sure what this does at the moment
					}
					console.log(button);
				},
				alerts.abandon.title,
				"Yes, Cancel"
			);
			return false;
		}
		if(toState.name != "summary" && toState.name != "step1")
			alertOnChange();
	});
	var cleanUpFunctionTwo = $rootScope.$on('$locationChangeStart', function(event, toState){
		if(toState.indexOf("step3") == -1 && toState.indexOf("step1") == -1 && toState.indexOf("summary") == -1) {
			event.preventDefault();
			Request.alert = new xAlert(alerts.abandon.body,
				function(button) {
					if(button == 1) {
						Request.reset();
						$state.go("step1");
						$urlRouter.sync();
					}
					console.log(button);
				},
				alerts.abandon.title,
				"Yes, Cancel"
			);
			return false;
		}
	});

	$scope.$on('$destroy', function() {
		cleanUpFunction();
		cleanUpFunctionTwo();
	});
	if(Request.complete) {
		Nav.direction = "forward";
	}
	$scope.companies = Request.companies;
	$scope.request = Request;
	GoogleMap.init();
	$scope.statuses = Request.statuses;
}])