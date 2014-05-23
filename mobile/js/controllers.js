'use strict';

/* Controllers */
angular.module('myApp.controllers', [])
    .controller('testRecording', ['$state', '$timeout', 'GoogleMap', 'User', 'Request', 'Times', 'Location', 'Overlay', 'Categories', '$scope', 'SCAPI', function($state, $timeout, GoogleMap, User, Request, Times, Location, Overlay, Categories, $scope, SCAPI){
        Request.setID(112669);
        //SCAPI.getCompaniesList().then(function(){
            $state.go("step2").then(function(){
                $state.go("recording");
            });
        //});
        /*
        SCAPI.getCompaniesList().then(function(){
            $state.go("step2").then(function(){
                $state.go("step3");
            });
            Request.pingStatusesStart();
            GoogleMap.init();
        });
        */
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
    .controller('wrapperController', ['$scope', 'User', '$q', 'Location', 'Recording', '$timeout',  function($scope, User, $q, Location, Recording, $timeout){
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
                        $scope.User.setZipcode(d);
                    });
                });
            }
        }
        if(isPhoneGap) {
        	Recording.init().then(function(){
            	
                
function SCRecording() {
    // Declare global variables
    this.state = 0; // 0: ready to record, 1: recording or recording stopped and is available
    this.liveStatus; // updates live, by the Media function
    this.statusState = 0; // 0 play, 1 pause
    // this.src = "recording.aiff"; // name of auio file
    if(device.platform == "Android") {
        this.src = "recording.amr"; // name of auio file
        this.mimeType = "audio/amr";
    }
    else {
        this.src = "recording.wav"; // name of auio file
        this.mimeType = "audio/wav";
    }
    this.audioType = this.src.split(".");
    this.audioType = this.audioType[1];
    if(this.audioType == "wav")
        this.audioType = "aiff";
    //this.extension = this.src.split(".");
    // override the wav extension in the amazon s3 bucket as a .aiff.  I don't like this, but we're doing it that way.  We've always used .aiff and iphones don't support aiff internally.  So I guess this is a hard-conversion on our end.
    //this.extension = (this.extension == "wav") ? "aiff" : this.extension[1];
    //this.extension = this.extension[1];
    this.mediaRec; // the object for recording and play sound
    this.directory; // holds a reference for directory reading
    this.recordingActive = 0;
    this.init();
}
                
                
SCRecording.prototype = {
    // Wait for PhoneGap to load
    init: function () {
        var self = this;
        self.ready();
    },

    // PhoneGap is ready
    ready: function () {
        var self = this;
        console.log("SCR.ready()");
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
            self.onFileSystemSuccess(fileSystem);
        }, function () {
            self.onError
        });
    },

    // clicking of the record button
    //
    onClick: function () {
        var self = this;
        console.log("onClick() " + self.state);
        switch (self.state) {
            case 0:
                self.startRecording();
                break;
            case 1:
                self.stopRecording();
                break;
            case 2:
                self.deleteAlert(function () {
                    self.resetRecording();
                });
                break;
            default:
                console.log("Recycling State");
                self.state = 0;
                break;
        }
        return false;
    },

	
    uploadVoice: function (callback) {
        var self = this;
        /*
        console.log("uploadVoice();");
        var options = new FileUploadOptions();
        options.fileKey = "file";
        options.fileName = self.src;
        options.mimeType = self.mimeType;

        var params = new Object();
        params.value1 = "test";
        params.value2 = "param";

        var win = function (r) {
            TRACK("DETAILS_RECORDING_SCREEN_AMAZON_UPLOAD_AUDIO_SUCCESS");
            console.log("Code = " + r.responseCode);
            console.log("Response = " + r.response);
            console.log("Sent = " + r.bytesSent);
            console.log("Final url was: " + $root + "components/audio-upload/upload.php?reqID=" + OOvaCall.requestID + "&audioType=" + self.audioType + "");
            console.log("now encoding at: " + $root + "api/mobile/v2/encodeAudio.php?requestID=" + OOvaCall.requestID + "&audioType=" + self.audioType + "");

            if (device.platform == "Android") {
                $.ajax({
                    url: $root + "api/mobile/v2/encodeAudio.php?requestID=" + OOvaCall.requestID + "&audioType=" + self.audioType + "",
                    success: function (data) {
                        TRACK("DETAILS_RECORDING_SCREEN_AMAZON_ENCODE_AUDIO_SUCCESS");
                        console.log("Successful ajax encoding audio, now calling back");
                        if (callback)
                            callback();
                    },
                    error: function (xhr, responseText, error) {
                        TRACK("DETAILS_RECORDING_SCREEN_AMAZON_ENCODE_AUDIO_FAILED", "MediaError");
                    }
                });
            }
            else {
                if (callback)
                    callback();
            }
        };

        var fail = function (error) {
            TRACK("DETAILS_RECORDING_SCREEN_AMAZON_UPLOAD_AUDIO_FAILED", "MediaError");
        };

        options.params = params;

        var ft = new FileTransfer();
        console.log("uploading file at location" + self.directory.fullPath + "/" + self.src);
        console.log("to location: " + $root + "components/audio-upload/upload.php?reqID=" + OOvaCall.requestID + "&audioType=" + this.audioType + "");
        ft.upload(self.directory.fullPath + "/" + self.src, $root + "components/audio-upload/upload.php?reqID=" + OOvaCall.requestID + "&audioType=" + this.audioType + "", win, fail, options);
        */
    },

    deleteAlert: function (okCallback, cancelCallback) {
        new xAlert("Are you sure you want to delete the details recording",
            function (button) {
                if (button == 1) {
                    if (okCallback)
                        okCallback();
                }
                else if (button == 2) {
                    if (cancelCallback)
                        cancelCallback();
                }

            },
            "",
            "Ok,Cancel"
        );

    },

    statusClick: function () {
        var self = this;
        console.log("statusClick() " + self.statusState);

        switch (self.statusState) {
            case 0:
                self.statusState++;
                self.playRecording();
                break;
            case 1:
                self.statusState--;
                self.pauseRecording();
                break;
            default:
                self.statusState = 0;
                break;
        }
    },

    repaint: function () {
        var self = this;
        if (self.recordingActive) {
            $(".recording-status")[0].className = "recording-status play";
            $(".recording-time").show();
            self.setAudioPosition(self.length);
        }
    },

    resetRecording: function () {
        var self = this;
        console.log("Resetting the recording");
        $(".recording-time").text("0:00").hide();
        self.state = 0;
        $(".recording-button")[0].className = "recording-button";
        $(".recording-status")[0].className = "recording-status";
        self.recordingActive = 0;
    },

    startRecording: function () {
        var self = this;
        $(".recording-time").show();
        $(".recording-button").addClass("stop");
        self.state = 1;

        //OOvaCall.deactivateButtons(true);

        self.saveDuringRecord = function () {
            return self.stopRecording();
        };
		
        // $("#actionbutton").bind("click", self.saveDuringRecord); moved to bindButtons
        
        console.log("startRecording() with path: " + self.directory.fullPath + "/" + self.src + "");
        self.fullPath = self.directory.fullPath + "/" + self.src;
        // Create your Media object
        setTimeout(function () {
            self.mediaRec = new Media(self.directory.fullPath + "/" + self.src,
                // Success callback
                function () {
                    console.log("mediaRec -> success");
                    return true;
                },
                // Error callback
                function (err) {
                    console.log("mediaRec -> error: " + err.code);
                },
                function (status) {
                	alert("stat");
                    self.liveStatus = status;
                });
            // Record audio
            self.mediaRec.startRecord();
            self.length = 0;
            self.setAudioPosition(self.length);

            self.recInterval = setInterval(function () {
                self.length += .250;
                self.setAudioPosition(self.length);
                console.log("Recording length: " + self.length + " seconds");
            }, 250);


        }, 5);
    },

    stopRecording: function () {
        var self = this;
        self.state = 2;
        //OOvaCall.activateButtons();
        // $("#actionbutton").unbind("click", self.saveDuringRecord); moved to bindButtons

        self.clearInterval();
        self.recInterval = null;
        console.log("stopRecording()");
        self.mediaRec.stopRecord();
        $(".recording-time").text("0:" + (self.length < 10 ? '0' : '') + Math.floor(self.length));

        if (self.length < 3) {
            new xAlert("Recording must be at least three seconds");
            self.resetRecording();
            return false;
        }
        else {
            //self.uploadVoice();
            $(".recording-button").removeClass("stop");
            $(".recording-status").removeClass("pause").addClass("play");
            self.recordingActive = 1;
            return true;
        }
    },

    pauseRecording: function () {
        var self = this;
        clearInterval(self.recInterval); // do not set to null
        $(".recording-status").removeClass("pause").addClass("play");
        self.mediaRec.pause();
    },

    setAudioPosition: function (position) {
        var position = (position) ? position : 0;
        $(".recording-time").text("0:" + (position < 10 ? '0' : '') + Math.floor(position));
    },

    clearInterval: function () {
        var self = this;
        clearInterval(self.recInterval);
        self.recInterval = null;
    },

    resetPlayback: function () {
        var self = this;
        self.statusState = 0;
        self.clearInterval();
        if (self.mediaRec) {
            self.mediaRec.stop();
            if ($(".recording-status").hasClass("pause"))
                $(".recording-status").removeClass("pause").addClass("play");
        }
    },

    playRecording: function () {
        var self = this;
        console.log("playRecording()");

        self.mediaRec = new Media(self.directory.fullPath + "/" + self.src, function () {
        }, function (err) {
        }, function (status) {
            self.liveStatus = status;
        });
        self.mediaRec.play();

        var playInterval = setInterval(function () {
            if (self.liveStatus == 1 || self.liveStatus == 2) {
                $(".recording-status").removeClass("play").addClass("pause");
                self.mediaRec.getCurrentPosition(function (position) {
                    if (position >= 0)
                        self.setAudioPosition((position));
                    console.log("Playing length: " + position + " seconds");
                }, function (e) {

                });
            }
            else {
                clearInterval(playInterval);
                if (self.liveStatus == 4) // reached the end of playback (status: STOPPED)
                    self.resetPlayback();
            }
        }, 100);
        $(".recording-status").removeClass("play").addClass("pause");

    },

    onFileSystemSuccess: function (fileSystem) {
        var self = this;
        console.log("filesystem is: " + fileSystem);
        console.log("onFileSystemSuccess()");
        // Get the data directory, creating it if it doesn't exist.
        fileSystem.root.getDirectory("", {create: true}, function (d) {
            self.onDirectory(d)
        }, function (error) {
            self.onError(error)
        });

        // Create the lock file, if and only if it doesn't exist.
        fileSystem.root.getFile(self.src, {create: true, exclusive: false}, function () {
            self.onFileEntry()
        }, function (error) {
            self.onError(error)
        });
    },

    onFileEntry: function () {
        console.log("onFileEntry()");
    },

    onDirectory: function (d) {
        var self = this;
        console.log("onDirectory()");
        console.log("Directory created: '" + d.name);
        self.directory = d;
        var reader = d.createReader();
        reader.readEntries(function (entries) {
            self.onDirectoryRead(entries)
        }, function (error) {
            self.onError(error)
        });
    },

    // Helpful if you want to see if a recording exists
    onDirectoryRead: function (entries) {
        var self = this;
        console.log("The dir has " + entries.length + " entries.");
        // Scan for audio src
        for (var i = 0; i < entries.length; i++) {
            console.log(entries[i].name + ' dir? ' + entries[i].isDirectory);
            if (entries[i].name == self.src) {
                console.log("file found");
            }
        }
    },

    onSuccess: function () {
        console.log("onSuccess()");
    },

    onError: function (error) {
        alert('onError(): ' + error.code + '\n' +
            'message: ' + error.message + '\n');
    }
};

        var SCR = new SCRecording();//.init();
        $timeout(function(){
        	SCR.startRecording();
        },1000);
        $timeout(function(){
        	SCR.stopRecording();
            
        },2000);
                
                
                
                
                
                
                
                
                
                
                
                
                
                
                
                
                
                
                
            });
            blipsRotate().then(function(){
                locate();
            });
        }
        else {
        	locate();
        }
            
	}])
    .controller('step1Controller', ['$stateParams', '$state', '$q', '$location', 'SCAPI', 'Request', 'Categories', 'Overlay', 'User', '$scope', 'Location', '$http', function($stateParams, $state, $q, $location, SCAPI, Request, Categories, Overlay, User, $scope, Location, $http) {
        var categoryFromParams = $location.search().source;
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
                console.log("aPI returned: ", d);
                Overlay.remove();
                deferred.resolve(d);
                $state.go("step2");
            });
            return deferred.promise;
        };
        $scope.categories = Categories;
    }])
    .controller('step2Controller', ['$timeout', 'SCAPI', 'Times', '$scope', 'User', 'Request', '$state', function($timeout, SCAPI, Times, $scope, User, Request, $state) {
        $scope.isPhoneGap = isPhoneGap;

        if($.isEmptyObject(Request.companies))
            SCAPI.getCompaniesList();
        console.log("STEP 2");
        $scope.Times = Times;
        $scope.Request = Request;
        $scope.timetable = function(){
            $state.go('timetable');
        };

        $scope.next = function(){
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
                $state.go("step2a");
            }
        }
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
        $scope.$on('$destroy', function() {
            cleanUpFunction();
        });
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
	