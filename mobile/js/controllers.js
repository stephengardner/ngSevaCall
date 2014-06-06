'use strict';

/* Controllers */
angular.module('myApp.controllers', [])

    .controller('test2', ['$state', '$timeout', 'GoogleMap', 'User', 'Request', 'Times', 'Location', 'Overlay', 'Categories', '$scope', 'SCAPI', function($state, $timeout, GoogleMap, User, Request, Times, Location, Overlay, Categories, $scope, SCAPI){
        Request.reset();
        Request.setID(testRequestID);
        SCAPI.getCompaniesList().then(function(){
            $state.go("step2").then(function(){
                $state.go("step3");
            });
            Request.pingStatusesStart();
            GoogleMap.init();
        });
    }])
    .controller('test3', ['Splash', 'Test', '$timeout', 'GoogleMap', 'User', 'Request', 'Times', 'Location', 'Overlay', 'Categories', '$scope', 'SCAPI', function(Splash, Test, $timeout, GoogleMap, User, Request, Times, Location, Overlay, Categories, $scope, SCAPI){
        Splash.remove();
    	Test.test2();
    }])
    .controller('test', ['$timeout', 'GoogleMap', 'User', 'Request', 'Times', 'Location', 'Overlay', 'Categories', '$scope', 'SCAPI', function($timeout, GoogleMap, User, Request, Times, Location, Overlay, Categories, $scope, SCAPI){
        $scope.companies = Request.companies;
        $scope.request = Request;
        Request.setID(testRequestID);
        $scope.numCompaniesAccepted = Request.numCompaniesAccepted;
        SCAPI.getCompaniesList().then(function(){
            Request.pingStatusesStart();
            GoogleMap.init();
        });
    }])
    .controller('bodyController', ['$rootScope', 'Request', 'Menu', '$attrs', '$scope', '$location', function($rootScope, Request, Menu, $attrs, $scope, $location){
        $location.path("/step1");
        $scope.menu = Menu;
        $scope.click = function($event) {
            Menu.active = false;
        };
       	
    }])
    .controller('wrapperController', ['Splash', '$http', 'Overlay', '$state', 'SCAPI', 'Request', 'Uploader', '$scope', 'User', '$q', 'Location', 'Recording', '$timeout', '$window', 'MapLoader',  function(Splash, $http, Overlay, $state, SCAPI, Request, Uploader, $scope, User, $q, Location, Recording, $timeout, $window, MapLoader){
        $scope.isPhoneGap = isPhoneGap;
		var iphone4 = (window.screen.height == (960 / 2));
		var iphone5 = (window.screen.height == (1136 / 2));
        if(iphone4)
        	$scope.iphone4 = true;
        else if(iphone5)
        	$scope.iphone5 = true;
        /*
        deprecated ios7 lookup.  No longer worried about status bar since it is removed by default.
        if(isPhoneGap && parseFloat(window.device.version) >= 7.0) {
        	$scope.ios7 = true;
        }
        else {
        	$scope.ios7 = false;
        }
        */
        function locate() {
            MapLoader.loadMaps().then(function(){
                if(!User.zipcode) {
                    Location.geoLocate().then(function(d){
                        User.setZipcode(d);
                    });
                }
            });
        }
        
        // Phonegap specific actions
        if(testingType=="recording") {
            Splash.blip().then(function(){
                Request.setID(112669);
                User.setName("Augie Testing");
                User.setPhone("3017047437");
                User.setEmail("augie@augie.augie");
                Request.setCategory("Test Spin");
                User.setZipcode("20854");
                SCAPI.step1().then(function(d){
                	Overlay.remove();
                    console.log("*Step1 Returned: ", d);
                    var results = d.split("|");
                    // this API formats a response with a pipe ("|") if it is successful
                    if(d.indexOf("|") == -1) {
                        new xAlert(d);
                        return false;
                    }
                    else {
                        $state.go("step2");
                    }
                	SCAPI.getCompaniesList().then(function(){
                        $state.go("recording").then(function(){
                            Recording.init().then(function(){
                                console.log("*Recording initialized");
                                Recording.startRecord();
                                $timeout(function(){
                                	Recording.stopRecord();
                                    Uploader.uploadRecording(Recording.toURL, { audioType : Recording.audioType, reqID : Request.id}).then(function(){
                                    	console.log("*Audio Encoding Successful");
                                        $http({
                                            url : api_root + "api/mobile/v2/encodeAudio.php?audioType=" + Recording.audioType + "&requestID=" + Request.id,
                                            method : "GET",
                                            headers : {'Content-Type': 'application/json'}
                                        }).success(function(d){
                                            console.log("*Audio Encoding returned: " + d);
                                            $state.go("step3");
                            				//Request.submit();
                                        }).error(function(){
                                            new xAlert("Error Encoding Recording");
                                        });
                                    });
                               	}, 2000);
                            });
                        });
                    });
                });
            });
        }
		else if (testingType=="recordingAndroid") {
			alert("TEST");
		}
        else if(isPhoneGap) {
    		Splash.blip().then(function(){
                Recording.init().then(function(){
                    console.log("*Recording file initialized and ready for recording");
                });
                locate();
            });
        }
        else {
        	locate();
        }
            
	}])
    .controller('step1Controller', ['$stateParams', '$state', '$q', '$location', 'SCAPI', 'Request', 'Categories', 'Overlay', 'User', '$scope', 'Location', '$http', function($stateParams, $state, $q, $location, SCAPI, Request, Categories, Overlay, User, $scope, Location, $http) {
        var categoryFromParams = $location.search().source;
        $scope.isPhoneGap = isPhoneGap;
        Request.reset();
        $scope.User = User;
        $scope.Request = Request;
        if(categoryFromParams) {
            for(var i = 0; i < Categories.length; i++){
                if (Categories[i].name == categoryFromParams) {
                    Request.categoryID = Categories[i].id;
                }
            }
            Request.setCategory(categoryFromParams);
        }

        $scope.change = function(){
            for(var i = 0; i < $scope.categories.length; i++){
                if($scope.categories[i].id == Request.categoryID) {
                    Request.setCategory($scope.categories[i].name);
                }
            }
            console.log("*Set Request category ID to:" + Request.categoryID);
            console.log("*Set Request category to:" + Request.category);
        };

        setTimeout(function(){
            document.getElementById("disabled").disabled = 'yes'
        }, 1);

        $scope.getLocation = function(){
            Overlay.add(1);
            Location.geoLocate().then(function(d){
                if(d) {
                    $scope.User.setZipcode(d);
                }
                Overlay.remove();
            });
        };

        $scope.next = function(){
            if(skipAPICalls) {
                Request.setID(testRequestID);
                $state.go("step2");
                return;
            }
            var deferred = $q.defer();
            Overlay.add(1);
            console.log("SCAPI: ", SCAPI);
            SCAPI.step1().then(function(d){
                Overlay.remove();
                console.log("*Step 1 Returned: ", d);
                var results = d.split("|");
                // this API formats a response with a pipe ("|") if it is successful
                if(d.indexOf("|") == -1) {
                    new xAlert(d);
                    return false;
                }
                else {
                    deferred.resolve(d);
                    $state.go("step2");
                }
            });
            return deferred.promise;
        };
        $scope.categories = Categories;
    }])
    .controller('step2Controller', ['Overlay', 'Uploader', '$http', 'Recording', '$timeout', 'SCAPI', 'Times', '$scope', 'User', 'Request', '$state', function(Overlay, Uploader, $http, Recording, $timeout, SCAPI, Times, $scope, User, Request, $state) {
        $scope.isPhoneGap = isPhoneGap;
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
                    },
                    "Alert",
                    "Cancel,Ok"
                );
            }
            else {
                $state.go("step2a");
            }
        };
    }])
    .controller('step2aController', ['$http', 'Uploader', 'Overlay', 'Recording', 'Storage', '$rootScope', 'User', 'Times', '$scope', 'Request', '$state', '$window', function($http, Uploader, Overlay, Recording, Storage, $rootScope, User, Times, $scope, Request, $state, $window){
        var UserBackup = angular.copy(User);
        var cleanUpFunction = $rootScope.$on('back', function(){
            User.setName(UserBackup.getName());
            User.setEmail(UserBackup.getEmail());
            User.setPhone(UserBackup.getPhone());
        });
        $scope.User = User;
        $scope.Times = Times;
        $scope.emailKeyup = function(d){
            d.stopPropagation();
            console.log(d);
        };
        var unMaskPhone = function() {
            if(User.phone != "")
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
                new xAlert("Invalid name");
            }
            else if(!User.isEmailValid()) {
                new xAlert("Invalid email");
            }
            else if(!User.isPhoneValid()) {
                new xAlert("Invalid phone number");
            }
            else {
                Storage.saveUser();
                UserBackup = angular.copy(User);
                
                if((Request.isDescriptionValid() || Recording.saved) && !Times.isEmpty()) {
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
    .controller('step3Controller', ['$urlRouter', '$rootScope', '$state', 'Nav', 'GoogleMap', 'Request', '$scope', function($urlRouter, $rootScope, $state, Nav, GoogleMap, Request, $scope){
        var cleanUpFunction = $rootScope.$on('$stateChangeStart', function(event, toState){
            function alertOnChange() {
                event.preventDefault();
                new xAlert(alerts.abandon.body,
                    function(button){
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
                new xAlert(alerts.abandon.body,
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
    .controller('summaryController', ['Request', 'SCAPI', '$scope', function(Request, SCAPI, $scope){
        Request.setID(112669);
        $scope.request = Request;
        $scope.acceptanceRate = Request.numCompaniesCalled ?  Math.round(((parseFloat( Request.numCompaniesAccepted  /  Request.numCompaniesCalled * 100)))) + "%" : "0%";
        SCAPI.timeSaved().then(function(d){
            $scope.timeSaved = d.timeSaved;
        });
        $scope.twitterMessage = encodeURIComponent("SevaCall found me help in minutes! sevacall.com #savetime #awesome @sevacall");
        $scope.twitterShare = function(){
            var url = "https://twitter.com/intent/tweet?url=http://www.sevacall.com&text="
            url += encodeURIComponent("SevaCall found me help in minutes! sevacall.com #savetime #awesome @sevacall");
            window.open(url, '_system');
        }
        $scope.facebookShare = function() {
            var url = "http://facebook.com/dialog/feed";
            url += "?app_id=543995755650717";
            url += "&link=www.sevacall.com";
            url += "&name= Seva Call - Tell us what and when, we'll find the professionals!";
            url += "&description=Seva Call works to find local businesses that can help you with your service need instantly, like a free personal concierge service. Within minutes you will be connected to providers that can service your specific problem, on your schedule, at your location.";
            url += "&redirect_uri=http://sevacall.com";
            console.log("popping up fb url: " + url);
            window.open("http://www.facebook.com/dialog/feed?app_id=543995755650717&link=http://www.sevacall.com&name="
                + encodeURIComponent("Seva Call - Tell us what and when, we'll find the professionals!") + "&redirect_uri=http://sevacall.com", '_system');
            return false;
        }
    }])
    .controller('menuController', ['$rootScope', '$parse', '$attrs', '$scope', 'Menu', function($rootScope, $parse, $attrs, $scope, Menu){
        $scope.Menu = Menu;
        $rootScope.$on("click",function(){
            Menu.active = false;
        });
    }])
    .controller('headerController', ['Nav', 'Request', '$rootScope', '$state', '$window', 'Menu', '$attrs', '$scope', function(Nav, Request, $rootScope, $state, $window, Menu, $attrs, $scope){
        $scope.request = Request; // this might case a bug on iphones, please check
        $scope.$on("$stateChangeSuccess", function(event, state){
            // weird bug -- reading the "state.name" object in the partial for ng-show will cause this page to flash
            if(state.name == "step1")
                $("#nav").hide();
            else
                $("#nav").show();
        });
        $scope.navigation = Nav;
        $scope.nav = function(){
            if(Nav.direction == "forward") {
                $rootScope.$broadcast('forward');
                $state.go("summary");
            }
            else {
                $rootScope.$broadcast('back');
                $window.history.back();
            }
        };
        $scope.menuToggle = function(){
            Menu.active = 1;
        };
    }])
    .controller('timeTableController', ['Times', '$scope', '$rootScope', function(Times, $scope, $rootScope){
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
    .controller('informationController', ['resolveSize', '$scope', '$window', function(resolveSize, $scope, $window){
    	// when the info page is generated or the window is resized, fit the video perfectly into the page with no added
        // black borders.  Meaning is needs a 16/9 aspect ratio.  Calculate the width of the window and adjust the height
        // accordingly.
        function resizeVideo() {
            var width = $(".ui-view-container").width();
            var height = parseInt(( width / 16 ) * 9) + 2;
            $("iframe").css({ "height": height + "px", "max-height" : "400px" });
            if(height < 400){
                $("iframe").css({"width": "100%" });
            }
            else {
                height = 400;
                width = (height / 9) * 16;
                $("iframe").css({"width": width + "px"});
            }
        }
        $scope.videoHeight = resolveSize[0];
        $scope.videoWidth = resolveSize[1];
        $("iframe").css(resolveSize[2]);

        angular.element($window).bind('resize',function(){
            resizeVideo();
        });
    }])
    .controller('recordingController', ['$q', '$urlRouter', '$rootScope', '$state', 'Recording', '$scope', function($q, $urlRouter, $rootScope, $state, Recording, $scope){
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
        
        // When the back button is clicked, a location chaneg is triggered.
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
            	//alert("Going bv recording.recording is: " + Recording.recording + " and length is: " + Recording.length);
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
	