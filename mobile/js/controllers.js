'use strict';

/* Controllers */
angular.module('myApp.controllers', [])
    .controller('testRecording', ['Recording', '$state', '$timeout', 'GoogleMap', 'User', 'Request', 'Times', 'Location', 'Overlay', 'Categories', '$scope', 'SCAPI', function(Recording, $state, $timeout, GoogleMap, User, Request, Times, Location, Overlay, Categories, $scope, SCAPI){
        
    }])
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
        $location.path("/step1");
        $scope.menu = Menu;
        $scope.click = function($event) {
            Menu.active = false;
        };
       	
    }])
    .controller('wrapperController', ['$http', 'Overlay', '$state', 'SCAPI', 'Request', 'Uploader', '$scope', 'User', '$q', 'Location', 'Recording', '$timeout',  function($http, Overlay, $state, SCAPI, Request, Uploader, $scope, User, $q, Location, Recording, $timeout){
        $scope.isPhoneGap = isPhoneGap;
        if(isPhoneGap && parseFloat(window.device.version) >= 7.0) {
        	$scope.ios7 = true;
        }
        else {
        	$scope.ios7 = false;
        }
        function blipsRotate() {
        	var deferred = $q.defer();
            var splash, blipImages;
            if(screen.height <= 480) { // iphone 4 == 480
                splash = document.getElementById("splashImg-iPhone4");
                blipImages = [
                                'img/splash-iphone4-1.jpg',
                                'img/splash-iphone4-2.jpg',
                                'img/splash-iphone4-3.jpg',
                                'img/splash-iphone4-4.jpg'
                                ];
            }
            else {
                splash = document.getElementById("splashImg-iPhone5");
                blipImages = [
                                'img/splash-iphone5-1.jpg',
                                'img/splash-iphone5-2.jpg',
                                'img/splash-iphone5-3.jpg',
                                'img/splash-iphone5-4.jpg'
                                ];
            }
            splash.style.left = 0;
            var index = 0;
            var blipping = setInterval(function() {
                if( index == 0 ) {
                    splash.src=blipImages[0];
                    if(navigator.splashscreen) {
                        navigator.splashscreen.hide();
                    }
                }
                else if( index == blipImages.length ) {
                    clearInterval(blipping);
                    $("#splashscreen").hide();
                    deferred.resolve(true);
                }
                else {
                    splash.src=blipImages[index];
                }
                index++;
            }, 400);
            return deferred.promise;
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
            blipsRotate().then(function(){
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
        else
        if(isPhoneGap && !testing) {
            blipsRotate().then(function(){
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

        $scope.next = function(){
            console.log("ALL TIMES:", Times);
            if(!Request.isDescriptionValid()){
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
                        
                                Ovarlay.add(1);
                                var finalStep = function() {
                           
                                    Request.submit().then(function(){
                                        Ovarlay.remove();
                                        $state.go("step3");
                                    });
                                };
                                /*
                                function finalStep() {
                                    Request.submit().then(function(){
                                        Ovarlay.remove();
                                        $state.go("step3");
                                    });
                                }
                                */
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
    .controller('recordingController', ['$rootScope', '$state', 'Recording', '$scope', function($rootScope, $state, Recording, $scope){
        $scope.recording = Recording;
        $scope.next = function(){
            $state.go("step2");
        };
    }]);
	