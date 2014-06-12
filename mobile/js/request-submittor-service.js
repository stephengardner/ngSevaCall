// a service that takes request dependencies and will submit the request or alert...
myApp.factory("RequestSubmittor", function($q, Overlay, Request, $state, Times, User, Recording, $timeout, Uploader, $http, SCAPI, AlertSwitch){
    var RequestSubmittor = {
        step1 : function() {
            var deferred = $q.defer();
            if(skipAPICalls) {
                Request.setID(testRequestID);
                $state.go("step2");
                deferred.resolve();
                return deferred.promise;
            }
            Overlay.add(1);
            console.log("SCAPI: ", SCAPI);
            SCAPI.step1().then(function(d){
                Overlay.remove();
                console.log("*Step 1 Returned: ", d);
                var results = d.split("|");
                // this API formats a response with a pipe ("|") if it is successful
                if(d.indexOf("requestID|") == -1) {
                    new xAlert(d);
                    return false;
                }
                else {
                    deferred.resolve(d);
                    $state.go("step2");
                }
            });
            return deferred.promise;
            
        },
        step2 : function() {
        	var deferred = $q.defer();
            function finalStep() {
                Request.submit().then(function(){
                    Overlay.remove();
                    $state.go("step3");
                	deferred.resolve();
                }, function() {
                	deferred.reject();
                });
            }
        	if(skipAPICalls) {
                Request.setDescription("This is a test description set by the skip API Calls variable");
                Times.buttons = { now : true };
                Request.submit().then(function(){
               		Overlay.remove();
                	$state.go("step3");
               		deferred.resolve();
            	});
            }
            else if(!Recording.saved && !Request.isDescriptionValid()){
                new xAlert("Description must be 7 words");
                deferred.reject();
            }
            else if(Times.isEmpty()){
                new xAlert("Please select a time");
                deferred.reject();
            }
            else if(User.isEmailValid() && User.isNameValid() && User.isPhoneValid()){
                new xAlert(alerts.call_companies.body,
                    function(button) {
                        if(button == 2) {
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
                                    deferred.reject();
                                    
                                });
                            }
                            else {
                                Overlay.message("Preparing Request...");
                                finalStep();
                            }
                        }
                    },
                    "Alert",
                    "Cancel,Ok"
                );
            }
            else {
                $state.go("step2a");
                deferred.resolve();
            }
            return deferred.promise;
        }
	};
    return RequestSubmittor;
});