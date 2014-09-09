myApp.controller('recordingController', ['$q', '$urlRouter', '$rootScope', '$state', 'Recording', '$scope', function($q, $urlRouter, $rootScope, $state, Recording, $scope){
	$scope.recording = Recording;
	/*
	 if(!Recording.saved && !Recording.mediaRecInitialized) {
	 // pre-initialize the startRecord cache so that it records immediately when button is clicked later
	 Recording.mediaRecInitialized = true;
	 Recording.mediaRec.startRecord(); //
	 Recording.mediaRec.stopRecord();
	 }
	 */
	// when the user tries to navigate away from the page using the menu, catch this event.
	// if the Recording is in progress, and less than 3 seconds, alert the user and prevent the page from moving
	// if the Recording is in progress, and greater than 3 seconds, save and proceed as normal
	var cleanUpFunction = $rootScope.$on('$stateChangeStart', function(event, toState){
		if(Recording.playing) {
			Recording.stop();
		}
		function alertOnChange() {
			Recording.stopRecord(1);
			Recording.reset();
			$rootScope.$apply();
			event.preventDefault();
			new xAlert("Recording must be at least 3 seconds",
				function(button){
					$urlRouter.sync();
				}
			);
		}
		if(Recording.recording && Recording.length < 3) {
			alertOnChange();
		}
		else if(Recording.recording && Recording.length >= 3) {
			Recording.stopRecord();
		}
	});

	// When the back button is clicked, a location change is triggered.
	// Catch the back button click and make sure that the Recording service is not in the process of recording audio.
	// if it is, and the recording is less than 3 seconds, prevent the back button and alert the user.
	// if it is, and the recording is greater than 3 seconds, stop the recording and save it, and then go back.
	var cleanUpFunctionTwo = $rootScope.$on('$locationChangeStart', function(event, toState){
		if(Recording.playing) {
			Recording.stop();
		}
		if(toState.indexOf("recording") == -1 && Recording.recording && Recording.length < 3){
			Recording.stopRecord(1);
			Recording.reset();
			$rootScope.$apply();
			event.preventDefault();
			new xAlert("Recording must be at least 3 seconds",
				function(button){
					$urlRouter.sync();
				});
			return false;
		}
		else if(Recording.recording && toState.indexOf("recording") == -1){
			Recording.stopRecord();
		}
	});

	// when the "Save" button is pressed, check if the recording is in progress.
	// if it is in progress, and less than three seconds, prevent the state change and stop the recording process.
	// if it is in progress, and greater than three seconds, stop the recording process and proceed as normal.
	$scope.next = function() {
		if(Recording.playing) {
			Recording.stop();
		}
		if(!Recording.recording) {
			$state.go("step2");
		}
		else if(!Recording.recording || Recording.length >= 3) {
			Recording.stopRecord();
			$state.go("step2");
		}
		else if(Recording.recording && Recording.length < 3){
			Recording.stopRecord(1);
			Recording.reset();
			$rootScope.$apply();
			event.preventDefault();
			new xAlert("Recording must be at least 3 seconds",
				function(button){
					$urlRouter.sync();
				}
			);
		}
		else {
			$state.go("step2");
		}
	};

	// when the controller is destroyed, remove the rootscope events
	$scope.$on('$destroy', function() {
		cleanUpFunction();
		cleanUpFunctionTwo();
	});
}]);