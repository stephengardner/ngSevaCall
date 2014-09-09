
myApp.controller('step2aController', ['Track', '$http', 'Uploader', 'Overlay', 'Recording', 'Storage', '$rootScope', 'User', 'Times', '$scope', 'Request', '$state', '$window',
	function(Track, $http, Uploader, Overlay, Recording, Storage, $rootScope, User, Times, $scope, Request, $state, $window){
		var UserBackup = angular.copy(User);
		var cleanUpFunction = $rootScope.$on('back', function(){
			User.setName(UserBackup.getName());
			User.setEmail(UserBackup.getEmail());
			User.setPhone(UserBackup.getPhone());
		});
		$scope.User = User;

		// Analytics - Track whether or not the name, phone, and email have been filled in properly.
		// Watch the variables, and only report this statistic once
		$scope.$watch('User.name', function(){
			if(!$rootScope.settingsCompletedOnce.name && User.isNameValid()){
				Track.event(2, "name_completed", true);
				$rootScope.settingsCompletedOnce.name = true;
			}
		});
		$scope.$watch('User.email', function(){
			if(!$rootScope.settingsCompletedOnce.email && User.isEmailValid()){
				Track.event(2, "email_completed", true);
				$rootScope.settingsCompletedOnce.email = true;
			}
		});
		$scope.$watch('User.phone', function(){
			if(!$rootScope.settingsCompletedOnce.phone && User.isPhoneValid()){
				Track.event(2, "phone_completed", true);
				$rootScope.settingsCompletedOnce.phone = true;
			}
		});
		$scope.Times = Times;
		$scope.emailKeyup = function(d){
			d.stopPropagation();
			console.log(d);
		};
		var unMaskPhone = function() {
			if(User.phone && User.phone != "")
				User.phone = String(parseInt(User.phone.replace(/[)( -]/g, "")));
		};

		var maskPhone = function() {
			if(User.phone > 0 && User.phone != "" && User.phone != "NaN")
				User.phone = User.phone.replace(/([\d]{3})([\d]{3})([\d]{4})/, '($1) $2-$3');
			if(User.phone == "NaN")
				User.phone = "";
		};

		$scope.$on('$destroy', function() {
			cleanUpFunction();
		});
		$scope.onPhoneFocus = unMaskPhone;
		$scope.onPhoneBlur = maskPhone;

		maskPhone();

		function finalStep() {
			Overlay.message("Preparing Request...");
			Request.submit().then(function(){
				Overlay.remove();
				$state.go("step3");
			});
		}
		$scope.next = function(){
			if(skipAPICalls) {
				User.setName("This is a test name");
				User.setEmail("test@test.test");
				User.setPhone(testPhoneNumber);
				finalStep();
				return;
			}
			if(!User.isNameValid()) {
				Track.event(3, "invalid_name_notification", true);
				new xAlert("Invalid name");
			}
			else if(!User.isEmailValid()) {
				Track.event(3, "invalid_email_notification", true);
				new xAlert("Invalid email");
			}
			else if(!User.isPhoneValid()) {
				Track.event(3, "invalid_phone_notification", true);
				new xAlert("Invalid phone number");
			}
			else {
				Storage.saveUser();
				UserBackup = angular.copy(User);

				if((Request.isDescriptionValid() || Recording.saved) && !Times.isEmpty()) {
					new xAlert(alerts.call_companies.body,
						function(button) {
							if(button == 2) {
								Track.event(2, 'confirm_notification_ok', true);
								Overlay.add(1);
								if(Recording.saved) {
									Overlay.message("Uploading Recording...");
									Uploader.uploadRecording(Recording.toURL, { audioType : Recording.audioType, reqID : Request.id}).then(function(){
										console.log("*Audio Uploaded");
										Overlay.message("Encoding Recording...");
										$http({
											url : api_root + "api/mobile/v2/encodeAudio.php?audioType=aiff&requestID=" + Request.id,
											method : "GET",
											headers : {'Content-Type': 'application/json'}
										}).success(function(d){
											console.log("*Audio Encoding returned: " + d);
											Overlay.message("Preparing Request...");
											finalStep();
										}).error(function(){
											new xAlert("Error Encoding Recording");
										});
									});
								}
								else {
									finalStep();
								}
							}
							else {
								Track.event(2, 'confirm_notification_no', true);
							}
						},
						"Alert",
						"Cancel,Ok"
					);
				}
				else {
					$window.history.back();
				}
			}
		}
	}])