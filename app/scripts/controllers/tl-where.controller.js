myApp.controller('tlWhereController', ['$appTutorial', 'User', '$scope', function($appTutorial, User, $scope){
	$scope.appTutorial = $appTutorial;
	$scope.zipcode = User.zipcode;
}]);