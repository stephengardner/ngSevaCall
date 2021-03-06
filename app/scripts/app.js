'use strict';
/**
 * SevaCall iPhone App 2.0
 * Author: Stephen Gardner (https://www.linkedin.com/profile/view?id=167519048)
 *
 */
window.onerror = function(message, url, lineNumber) {
	console.log("SCError: "+message+" in "+url+" at line "+lineNumber);
}

var checkPhoneGap = function() {
	return (typeof(cordova) !== 'undefined' || typeof(phonegap) !== 'undefined');
}
var isPhoneGap = checkPhoneGap();
var testing = false;
var testRequestID = 112669;
var testPhoneNumber = "(301) 704-7437"; // Augie's number!
var skipAPICalls = false;
var testingType = ""; //statusBug
var environment = "production", root, api_root;
var mapsLoaded = false; // requires internet to grab google map

var appOptions = {
	analytics : {
		gaStorageName : 'sc_clientId',
		app : {
			iPhone : {
				'Google Analytics Property Name' : 'Seva Call Consumer iPhone App v2',
				'gaID' : 'UA-9179910-16'

			},
			Android : {
				'Google Analytics Property Name' : 'Seva Call Consumer Android App v2',
				'gaID' : 'UA-9179910-17'

			}
		},
		web : {
			'Google Analytics Property Name' : 'Seva Call Consumer Mobile Web v2',
			'gaID' : 'UA-9179910-18'
		},
		eventTypes : {
			'default' : 'notify', // when no eventType specified as first param
			1 : "page",
			2 : "interaction",
			3 : "alert"
		}
	}
};
var alerts = {
	call_companies :  {
		body : "Call companies now? You may receive up to three calls"
	},
	home : {
		title : "Start Over?",
		body : "Returning to step 1 will cancel your current request, continue?"
	},
	abandon : {
		title : "Start Over?",
		body : "Are you sure you want to abandon this request?"
	}
};
if(environment == "local" && !isPhoneGap) {
	root = ""; //"../../"
	api_root = "http://localhost/";
}
else if(environment == "local" && isPhoneGap) {
	root = "";
	api_root = "http://test.s17.sevacall.com/";
}
else if(environment == "development") {
	if(isPhoneGap) {
		root = "";
	}
	else {
		root = "http://test.s17.sevacall.com/mobile/";
	}
	api_root = "http://test.s17.sevacall.com/";
}
else if(environment == "production") {
	console.log = function(msg) {};
	console.warn = function(msg) {};
	console.error = function(msg) {};
	root = "";
	if(isPhoneGap) {
		api_root = "http://www.talklocal.com/";
	}
	else {
		api_root = "../";
	}
}
String.prototype.capitalize = function () {
	return this.toLowerCase().replace(/^.|\s\S/g, function (a) {
		return a.toUpperCase();
	});
};
/**
 * Created by Developer on 7/3/14.
 */

// Declare app level module which depends on filters, and services
var myApp = angular.module('myApp', [
        'myApp.services',
        'myApp.directives',
        'myApp.controllers',
        'ui.router',
        'ngAnimate',
        'ngStorage',
		'appTutorial'
    ])
	.factory('MyInterceptor', ['$q', '$rootScope', '$injector', '$timeout', 'Overlay',
	function ($q, $rootScope, $injector, $timeout, Overlay) {
        var errorCount = 0;
		console.log("http interceptor");
        var MyInterceptor = function(promise){
            var trackInternetFailed = function(){
	            $injector.get('Track').event(3, "alert_internet_failed");
            }
            var self = this;
            return promise.then(function (response) {
                // do something on success
                console.log("*--*Http Wrapper Success Response: ", response);
	            // this is NOT the correct way to check this data, however, the sevacall api is not completely standardized yet, so this check is temporary.
	            // what this does: it checks to see if the http response was a webpage, this happens if there is a sign on required for your wifi connection.  If you need to be signed in, then this response is obviously not correct, so warn the user.
	            if(response.data && typeof response.data == "string" && response.data.indexOf("DOCTYPE") != -1) {
                	var deferred = $q.defer();
		            trackInternetFailed();
					if(!$rootScope.internetError) {
						$rootScope.internetError = 1;
						new xAlert("Verify you are connected to the internet and retry.",
							function(button){
								if(button == 1){
									$rootScope.internetError = 0;
									var $http = $injector.get('$http');
									return $http(response.config);
								}
								else {
									$rootScope.internetError = 0;
									Overlay.remove();
									$q.reject("rejected");
								}
							},
							"Connection Error",
							"Retry, Cancel"
						);
					}
                    return deferred.promise;
                }
				else {
					console.log("*Response was valid and we're connected to the internet... returning");
				}
                return response;
            }, function (response) {
                console.log("-*-Http wrapper error response: ", response);
                if(response.status == 500) {
                    // put a more significant error in here
                }
                if(errorCount >= 2 ) { // checks to see if this is the third error
                    errorCount = 0;
                    var deferred = $q.defer();
	                trackInternetFailed();
					if(!$rootScope.internetError) {
						$rootScope.internetError = 1;
						new xAlert("Verify you are connected to the internet and retry.",
							function(button){
								if(button == 1){
									$rootScope.internetError = 0;
									var $http = $injector.get('$http');
									return $http(response.config);
								}
								else {
									$rootScope.internetError = 0;
									Overlay.remove();
									$q.reject("rejected");
								}
							},
							"Connection Error",
							"Retry, Cancel"
						);
					}
                    return deferred.promise;
                }
                else {
                    errorCount++;
                    var $http = $injector.get('$http');
                    return $http(response.config);
                }
                return $q.reject(response);
            });
        };
        return MyInterceptor;
    }])
	.config(["$httpProvider", function ($httpProvider) {
        $httpProvider.responseInterceptors.push('MyInterceptor');
    }])
    .config(["$httpProvider", function ($httpProvider) {
        $httpProvider.defaults.transformRequest = function(data) {
            if (data === undefined) {
                return data;
            }
            return $.param(data);
        }
    }])
	// config the $http to coincide with our progressBar
    .config(["$httpProvider", function($httpProvider){
        $httpProvider.responseInterceptors.push(['$q', '$rootScope',
	        function($q, $rootScope){
	            return function(promise){
	                $rootScope.$broadcast("event:routeChangeStart");
	                return promise
	                    .then(
	                    function(response){
	                        $rootScope.$broadcast("event:routeChangeSuccess");
	                        return response;
	                    },
	                    function(response){ //on error
	                        $rootScope.$broadcast("event:routeChangeError");
	                        return $q.reject(response);
	                    }
	                )
	            }
            }]
        )
    }])
// UI-router config
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        // route to root if no valid route found
        $urlRouterProvider.otherwise('/step1');

        // home: an abstract route, load the home.html
        var step1 = {
            name : 'step1',
            url : '/step1',
            controller : 'step1Controller',
            templateUrl: root + 'views/home.html'
        };
        var step2 = {
            name : 'step2',
            url : '/step2',
            controller : 'step2Controller',
            templateUrl: root + 'views/step2.html',
            resolve : {
                resolveAPI : ['Overlay', '$q', 'SCAPI', '$location', 'Request',
	                function(Overlay, $q, SCAPI, $location, Request){
	                    if(Request.id)
	                        return true;
	                    var deferred = $q.defer();
	                    Overlay.add(1);
	                    SCAPI.step1().then(function(d){
	                        if(d == "Invalid Location"){
	                            console.log("-*-Invalid step 2");
	                            $location.path("/");
	                        }
	                        Overlay.remove();
	                        deferred.resolve(d);
	                    });
	                    return deferred.promise;
	                }]
            }
        };
        var step3 = {
            name : 'step3',
            url : '/step3',
            controller : 'step3Controller',
            templateUrl: root + 'views/step3.html'
        };
        var recording = {
            name : 'recording',
            url : '/recording',
            controller : 'recordingController',
            templateUrl: root + 'views/recording.html'
        };
        var timetable = {
            name : 'timetable',
            url : '/timetable',
            controller : 'timeTableController',
            templateUrl: root + 'views/timetable.html'
        };
        var step2a = {
            name : 'step2a',
            url : '/step2a',
            controller : 'step2aController',
            templateUrl: root + 'views/step2a.html'
        };
        var settings = {
            name : 'settings',
            url : '/settings',
            controller : 'step2aController',
            templateUrl: root + 'views/step2a.html'
        };
        var information = {
            name : 'information',
            url : '/information',
            controller : 'informationController',
            templateUrl: root + 'views/information.html',
            resolve : {
                resolveSize : [function() {
                    var width = $(".ui-view-container").width();
                    var height = parseInt(( width / 16 ) * 9) + 2; // i don't know why this is -8 right now
                    var css = { "height": height + "px", "max-height" : "400px" };
                    if(height < 400){
                        css = {"width": "100%" };
                    }
                    else {
                        height = 400;
                        width = (height / 9) * 16;
                        css = {"width": width + "px"};
                    }
                    return [height, width, css];
                }]
            }
        };
        var summary = {
            name : 'summary',
            url : '/summary',
            controller : 'summaryController',
            templateUrl: root + 'views/summary.html'
        };
        $stateProvider.state(step1);
        $stateProvider.state(step2);
        $stateProvider.state(step3);
        $stateProvider.state(recording);
        $stateProvider.state(summary);
        $stateProvider.state(timetable);
        $stateProvider.state(step2a);
        $stateProvider.state(settings);
        $stateProvider.state(information);
    }])
	.run(['Track', '$appTutorial', '$animate', 'appStateTracker', 'Storage', 'SCAPI', 'Request', '$rootScope', 'Menu', '$state', '$urlRouter', '$window', '$location', 'Nav',
		'AlertSwitch',
		function(Track, $appTutorial, $animate, appStateTracker, Storage, SCAPI, Request, $rootScope, Menu, $state, $urlRouter, $window, $location, Nav, AlertSwitch){

		Storage.import();
		SCAPI.init(Request);
		FastClick.attach(document.body);
		$rootScope.settingsCompletedOnce = {
			name : false,
			email : false,
			phone : false
		};

		Track.init();
		Track.event(1, "application_opened");
		$rootScope.$on('requestCompleted', [function(){
			console.warn("SC-Deprecated: rootScope broadcast('requestCompleted')");
            $state.go("summary");
        }]);

		$rootScope.$on('$locationChangeSuccess', function(){
			console.log("*page*" + $location.url());
			Track.event(1, $location.url().replace("/", "") + "_screen_opened");
			// only call if the event.preventDefault isn't active from the locationChangeStart
			Nav.reset();
		});

        $rootScope.$on('$stateChangeStart', function(event, toState){
            console.log("-Going to state: " + toState.name);
            //alert(toState.name);
            if((toState.name == "step2" || toState.name == "step3") && !Request.id) {
                $location.path("/step1");
            }
            // MENU BUTTON PRESSED ONLY
            function alertOnChange() {
                console.log("*-*Preventing default change on state change Menu Button");
                event.preventDefault();

                var reset = function() {
                	Request.reset();
                    $state.go(toState.name);
                    $urlRouter.sync(); // not sure what this does at the moment
                }
                if(AlertSwitch.on) {
                	new xAlert(alerts.abandon.body,
                        function(button){
                            if(button == 1){
                               reset();
                            }
                        },
                        alerts.abandon.title,
                        "Yes, Cancel"
                	);
                	return false;
                }
                else {
                	reset();
                }
            }
            if(Request.id && !Request.complete && toState.name == "step1") {
                return alertOnChange();
            }
			Menu.close();
			console.log("*Menu closed");
        });

        // Do not allow step2 or step3 access without first obtaining a request id from step 1.  Resetting the request will remove the request id
        $rootScope.$on('$locationChangeStart',
            function(event, toState) {
				var reset = function() {
                    Request.reset();
                    $state.go("step1");
                    $urlRouter.sync(); // not sure what this does at the moment
                };
                // BACK BUTTON TO PAGE 1 ONLY
                function alertOnChange() {
                	console.log("*-*Preventing default change on location change Back Button");
                    event.preventDefault();
                    if(AlertSwitch.on) {
                        new xAlert(alerts.abandon.body,
                        function(button){
                            if(button == 1){
                            	reset();
                            }
                        },
                        alerts.abandon.title,
                        "Yes, Cancel"
                    	);
                    	return false;
                    }
                    else {
                    	reset();
                    }

                }
                if(Request.id && !Request.complete && toState.indexOf("step1") != -1) {
                    return alertOnChange();
                }

                // STEP 2 OR STEP 3 WITHOUT REQUEST ID ONLY
                else if((toState.indexOf("step3") != -1 || toState.indexOf("step2") != -1) && !Request.id){
                    $location.path("/step1");
                }
            }
        );
    }]).filter('orderObjectBy', [function() {
        return function(items, field, reverse) {
            var filtered = [];
            angular.forEach(items, function(item) {
                filtered.push(item);
            });
            filtered.sort(function (a, b) {
                return (a[field] > b[field]);
            });
            if(reverse) filtered.reverse();
            return filtered;
        };
    }])
	.filter('reverse', [function() {
	    return function(items) {
	        return items.slice().reverse();
	    };
	}]);
