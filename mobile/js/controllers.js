'use strict';

/* Controllers */
angular.module('myApp.controllers', [])

    .controller('test2', ['$state', '$timeout', 'GoogleMap', 'User', 'Request', 'Times', 'Location', 'Overlay', 'Categories', '$scope', 'SCAPI', function($state, $timeout, GoogleMap, User, Request, Times, Location, Overlay, Categories, $scope, SCAPI){
        Request.reset();
        Request.setID(112669);
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
    	Test.test1();
    }])
    .controller('test', ['$timeout', 'GoogleMap', 'User', 'Request', 'Times', 'Location', 'Overlay', 'Categories', '$scope', 'SCAPI', function($timeout, GoogleMap, User, Request, Times, Location, Overlay, Categories, $scope, SCAPI){
        $scope.companies = Request.companies;
        $scope.request = Request;
        Request.setID(112669);
        $scope.numCompaniesAccepted = Request.numCompaniesAccepted;
        console.log("Request is: ", Request);
        SCAPI.getCompaniesList().then(function(){
            Request.pingStatusesStart();
            GoogleMap.init();
        });
    }])
    .controller('bodyController', ['$rootScope', 'Request', 'Menu', '$attrs', '$scope', '$location', function($rootScope, Request, Menu, $attrs, $scope, $location){
        $location.path("/recording");
        $scope.menu = Menu;
        $scope.click = function($event) {
            Menu.active = false;
        };
       	
    }])
    .controller('wrapperController', ['Splash', '$http', 'Overlay', '$state', 'SCAPI', 'Request', 'Uploader', '$scope', 'User', '$q', 'Location', 'Recording', '$timeout',  function(Splash, $http, Overlay, $state, SCAPI, Request, Uploader, $scope, User, $q, Location, Recording, $timeout){
        $scope.isPhoneGap = isPhoneGap;
        if(isPhoneGap && parseFloat(window.device.version) >= 7.0) {
        	$scope.ios7 = true;
        }
        else {
        	$scope.ios7 = false;
        }
        
        function locate() {
        	if(!User.zipcode) {
                $(document).ready(function(){
                    Location.geoLocate().then(function(d){
                        User.setZipcode(d);
                    });
                });
            }
        }
    	
        // Phonegap specific actions
        if(testingType=="recording") {
            Splash.blip.then(function(){
                Request.setID(112669);
                User.setName("Augie Testing");
                User.setPhone("3017047437");
                User.setEmail("augie@augie.augie");
                Request.setCategory("Test Spin");
                User.setZipcode("20854");
                SCAPI.step1().then(function(d){
                	Overlay.remove();
                    console.log("STEP1 Returned: ", d);
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
                                console.log("Recording initialized");
                                Recording.startRecord();
                                $timeout(function(){
                                	Recording.stopRecord();
                                    Uploader.uploadRecording(Recording.toURL, { audioType : Recording.audioType, reqID : Request.id}).then(function(){
                                    console.log("done uploading, now going to encode");
                                        $http({
                                            url : api_root + "api/mobile/v2/encodeAudio.php?audioType=aiff&requestID=" + Request.id,
                                            method : "GET",
                                            headers : {'Content-Type': 'application/json'}
                                        }).success(function(d){
                                            console.log("encodeAudio returned: " + d);
                                            $state.go("step3");
                            				Request.submit();
                                        }).error(function(){
                                            alert("ERROR");
                                        });

                                    });
                                    //var deferred = $q.defer();
                               	}, 2000);
                            });
                        });
                    });
                });
                /*
                SCAPI.getCompaniesList().then(function(){
                    $state.go("step2").then(function(){
                        $state.go("recording");
                        Recording.init().then(function(){
                        	console.log("Recording initialized");
                            Uploader.uploadRecording(Recording.toURL, { audioType : Recording.audioType, reqID : Request.id}).then(function(){
                            	console.log("----all done----");
                            });
                        });
                    });
                });
                */
            });
        }
        else if(isPhoneGap) {
    		Splash.blip().then(function(){
                Recording.init().then(function(){
                    console.log("Recording file initialized and ready for recording");
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
            console.log("Set Request category ID to:" + Request.categoryID);
            console.log("Set Request category to:" + Request.category);
        };

        setTimeout(function(){
            document.getElementById("disabled").disabled = 'yes'
        }, 1);

        $scope.getLocation = function(){
        	console.log("-------1-------");
            Overlay.add(1);
        	console.log("-------2-------");
            Location.geoLocate().then(function(d){
                if(d) {
                    console.log("resovled to: ", d)
                    $scope.User.setZipcode(d);
                }
                else
                    console.log("d is false");
                Overlay.remove();
            });
        	console.log("-------3-------");
        };

        $scope.next = function(){
            var deferred = $q.defer();
            Overlay.add(1);
            console.log("SCAPI: ", SCAPI);
            SCAPI.step1().then(function(d){
                Overlay.remove();
                console.log("STEP1 Returned: ", d);
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
        console.log("STEP 2");
        $scope.Times = Times;
        $scope.Request = Request;
        $scope.timetable = function(){
            $state.go('timetable');
        };
        $scope.recordingSaved = Recording.saved;
        if($scope.recordingSaved) {
            $("textarea").attr("placeholder", "Recording Saved").val("");
        }
		
        function finalStep() {
            Request.submit().then(function(){
                Overlay.remove();
                $state.go("step3");
            });
        }
        $scope.next = function(){
            console.log("ALL TIMES:", Times);
            if(!Recording.saved && !Request.isDescriptionValid()){
                new xAlert("Description must be 7 words");
                return false;
            }
            else if(Times.isEmpty()){
                new xAlert("Please select a time");
                return false;
            }
            else if(User.isEmailValid() && User.isNameValid() && User.isPhoneValid()){
                new xAlert("Call companies now? You may receive up to three calls",
                    function(button) {
                        if(button == 2) {
    							Overlay.add(1);
                                if(Recording.saved) {
                                    Uploader.uploadRecording(Recording.toURL, { audioType : Recording.audioType, reqID : Request.id}).then(function(){
                                        console.log("done uploading, now going to encode");
                                        $http({
                                            url : api_root + "api/mobile/v2/encodeAudio.php?audioType=aiff&requestID=" + Request.id,
                                            method : "GET",
                                            headers : {'Content-Type': 'application/json'}
                                        }).success(function(d){
                                            console.log("encodeAudio returned: " + d);
                                            finalStep();
                                        }).error(function(){
                                            alert("ERROR");
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
                $state.go("step2a");
            }
        };
    }])
    .controller('step2aController', ['Storage', '$rootScope', 'User', 'Times', '$scope', 'Request', '$state', '$window', function(Storage, $rootScope, User, Times, $scope, Request, $state, $window){
        var UserBackup = angular.copy(User);
        var cleanUpFunction = $rootScope.$on('back', function(){
            console.log("------------------------- rootscope back --------------------------------");
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

        $scope.next = function(){
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
                if(Request.isDescriptionValid() && !Times.isEmpty()) {
                    new xAlert(alerts.call_companies.body,
                        function(button) {
                            if(button == 2) {
                                $state.go("step3");
                                Request.submit().then(function(){
                                });
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
                console.log(" -------------------- preventing default change on state3 change -------------------------");
                event.preventDefault();
                new xAlert(alerts.abandon.body,
                    function(button){
                        if(button == 1){
                            console.log(" -------------------- resetting request and changing path -------------------------");
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
                            console.log(" -------------------- resetting request and changing path -------------------------");
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
        console.log("TIMES:" + Times.postify());
        var tempTimes = angular.copy(Times.timesActive);
        var cleanUpFunction = $rootScope.$on('back', function(){
            console.log("------------------------- rootscope back (reset timeTable)to times: --------------------------------", tempTimes);
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
        
        // when the user tries to navigate away from the page using the menu, catch this event.
        // if the Recording is in progress, and less than 3 seconds, alert the user and prevent the page from moving
        // if the Recording is in progress, and greater than 3 seconds, save and proceed as normal
        var cleanUpFunction = $rootScope.$on('$stateChangeStart', function(event, toState){
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
            	Recording.stopRecord;
            }
        });
        
        // When the back button is clicked, a location chaneg is triggered.
        // Catch the back button click and make sure that the Recording service is not in the process of recording audio.
        // if it is, and the recording is less than 3 seconds, prevent the back button and alert the user.
        // if it is, and the recording is greater than 3 seconds, stop the recording and save it, and then go back.
        var cleanUpFunctionTwo = $rootScope.$on('$locationChangeStart', function(event, toState){
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
        $scope.next = function(){
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
	