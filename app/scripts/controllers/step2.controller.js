myApp.controller('step2Controller', ['Track', 'RecordingModal', 'Overlay', 'Uploader', '$http', 'Recording', '$timeout', 'SCAPI', 'Times',
	'$scope', 'User', 'Request', '$state', '$interval',
	function(Track, RecordingModal, Overlay, Uploader, $http, Recording, $timeout, SCAPI, Times, $scope, User, Request, $state, $interval) {
		$scope.isPhoneGap = isPhoneGap;
		$scope.recordingModal = RecordingModal;
		if($.isEmptyObject(Request.companies))
			SCAPI.getCompaniesList();

		$scope.Times = Times;
		$scope.Request = Request;
		$scope.timetable = function(){
			$state.go('timetable');
		};
		$scope.recordingSaved = Recording.saved;
		if(Recording.saved) {
			Request.setDescription("");
			$("textarea").attr("placeholder", "Recording Saved").val("");
		}
		else {
			$("textarea").attr("placeholder", "Describe what you need help with in as much detail as possible...");
		}

		function finalStep() {
			Request.submit().then(function(){
				Overlay.remove();
				$state.go("step3");
			});
		}
		$scope.next = function(){
			if(skipAPICalls) {
				Request.setDescription("This is a test description set by the skip API Calls variable");
				Times.buttons = { now : true };
				$state.go("step2a");
				return;
			}
			if(!Recording.saved && !Request.isDescriptionValid()){
				new xAlert("Description must be 7 words");
				return false;
			}
			else if(Times.isEmpty()){
				new xAlert("Please select a time");
				return false;
			}
			else if(User.isEmailValid() && User.isNameValid() && User.isPhoneValid()){
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
										url : api_root + "api/mobile/v2/encodeAudio.php?audioType=" + Recording.audioType + "&requestID=" + Request.id,
										method : "GET",
										headers : {'Content-Type': 'application/json'}
									}).success(function(d){
										console.log("*Audio Encoding returned: " + d);
										Overlay.message("Preparing Request...");
										finalStep();
									}).error(function(){
										new xAlert("Error Encoding Recording");
									});
								}, function(){
									// if the recording upload was rejected due to a bad internet connection.
									Overlay.remove();
								});
							}
							else {
								Overlay.message("Preparing Request...");
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
				$state.go("step2a");
			}
		};

		// initializing the recording on step 2, so that step 1 is not further delayed during processing.
		// delay this until transition end so that slower processing phones don't have a problem on transitioning
		var addModalOnTransitionEnd = function(){
			if($(this).css("left") == "0px") {
				//addIframe();
				$timeout(function(){
					RecordingModal.show();
				}, 1000);
				$("#bodyContainer").unbind('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd',
					addModalOnTransitionEnd);
			}
		};

		$("#bodyContainer").bind('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd',
			addModalOnTransitionEnd);

		// set an interval that will display the modal recording popup, this is necessary because some phones - specifically the HTC ONE,
		// are not responding to the transitionEnd events
		var modalInterval = $interval(function() {
			if(!RecordingModal.hasBeenActive) {
				if($("#bodyContainer").css("left") == "0px") {
					RecordingModal.show();
					$interval.cancel(modalInterval);
				}
			}
			else {
				$interval.cancel(modalInterval);
			}
		}, 1000);
		// set an interval to initialize the recording of the app.  Delaying it so that less processing is done during the transition
		// this leaves for a cleaner transition
		if(isPhoneGap) {
			var recordingInitializeInterval = $interval(function() {
				if(!Recording.initialized) {
					if($("#bodyContainer").css("left") == "0px") {
						Recording.init();
						$interval.cancel(recordingInitializeInterval);
					}
				}
				else {
					$interval.cancel(recordingInitializeInterval);
				}
			}, 1000);
		}

		$scope.$on('$destroy', function() {
			$("#bodyContainer").unbind('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd');
		});
	}])