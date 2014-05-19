'use strict';
var isPhoneGap = true;
var testing = true;
var environment = "local", root, api_root;
var home_alert_title = "Start Over?";
var home_alert = "Returning to step 1 will cancel your current request, continue?";
var abandon_request = "Are you sure you want to abandon this request?";
var abandon_request_title = "Start Over?"
if(environment == "local") {
    root = "/augie/ng/app/";
    api_root = "http://localhost/";
}
else if(environment == "development"){
    root = "http://test.s17.sevacall.com/augie/ng/app/"
    api_root = "http://test.s17.sevacall.com/";
}
else if(environment == "production") {
    root = "http://www.sevacall.com/"
    api_root = root;
}

String.prototype.capitalize = function () {
    return this.toLowerCase().replace(/^.|\s\S/g, function (a) {
        return a.toUpperCase();
    });
};

// Declare app level module which depends on filters, and services
var myApp = angular.module('myApp', [
        'myApp.filters',
        'myApp.services',
        'myApp.directives',
        'myApp.controllers',
        'ui.router',
        'ngAnimate',
        'LocalStorageModule'
    ]).config(function ($httpProvider) {
    $httpProvider.defaults.transformRequest = function(data){
        if (data === undefined) {
            return data;
        }
        return $.param(data);
    }
})
// config the $http to coincide with our progressBar
    .config(["$httpProvider", function($httpProvider){
        $httpProvider.responseInterceptors.push(function($q, $rootScope){
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
        })
    }])
// UI-router config
    .config(function($stateProvider, $urlRouterProvider) {

        // route to root if no valid route found
        $urlRouterProvider.otherwise('/step1');

        // home: an abstract route, load the home.html

        var step1 = {
            name : 'step1',
            url : '/step1',
            controller : 'step1Controller',
            templateUrl: root + 'partials/home.html'
        };
        var step2 = {
            name : 'step2',
            url : '/step2',
            controller : 'step2Controller',
            templateUrl: root + 'partials/step2.html',
            resolve : {
                resolveAPI : function(Overlay, $q, SCAPI, $location, Request){
                    if(Request.id)
                        return true;
                    var deferred = $q.defer();
                    Overlay.add(1);
                    SCAPI.step1().then(function(d){
                        if(d == "Invalid Location"){
                            console.log("Invalid step 2");
                            $location.path("/");
                        }
                        console.log("aPI returned: ", d);
                        Overlay.remove();
                        deferred.resolve(d);
                    });
                    return deferred.promise;
                }
            }
        };
        var step3 = {
            name : 'step3',
            url : '/step3',
            controller : 'step3Controller',
            templateUrl: root + 'partials/step3.html'
        };
        var recording = {
            name : 'recording',
            url : '/recording',
            controller : 'recordingController',
            templateUrl: root + 'partials/recording.html'
        };
        var timetable = {
            name : 'timetable',
            url : '/timetable',
            controller : 'timeTableController',
            templateUrl: root + 'partials/timetable.html'
        };
        var step2a = {
            name : 'step2a',
            url : '/step2a',
            controller : 'step2aController',
            templateUrl: root + 'partials/step2a.html'
        };
        var settings = {
            name : 'settings',
            url : '/settings',
            controller : 'step2aController',
            templateUrl: root + 'partials/step2a.html'
        };
        var information = {
            name : 'information',
            url : '/information',
            controller : 'informationController',
            templateUrl: root + 'partials/information.html',
            resolve : {
                resolveSize : function() {
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
                }
            }
        };
        var summary = {
            name : 'summary',
            url : '/summary',
            controller : 'summaryController',
            templateUrl: root + 'partials/summary.html'
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
    }).run(function(Storage, SCAPI, Request, $rootScope, Menu, $state, $urlRouter, $window, $location, Nav){
        Storage.import(); // loads the local storage into the user name, email, phone and zip
        SCAPI.init(Request);
        $rootScope.$on('requestCompleted', function(){
            $state.go("summary");
        });
        $rootScope.$on('$stateChangeSuccess',
            function(event, toState, toParams, fromState, fromParams){
                Menu.active = false;
                console.log("State Change: State change success!");
            });
        $rootScope.$on('$stateChangeStart', function(event, toState){
            Menu.active = false;
            /*
            if($state.current.name == "step3") {
                alert();
            }
            */
            // MENU BUTTON PRESSED ONLY
            if(Request.id && toState.name == "step1") {
                console.log(" -------------------- preventing default change on state change -------------------------");
                event.preventDefault();
                new xAlert(home_alert,
                    function(button){
                        if(button == 1){
                            console.log(" -------------------- resetting request and changing path -------------------------");
                            Request.reset();
                            $state.go("step1");
                            $urlRouter.sync(); // not sure what this does at the moment
                        }
                        console.log(button);
                    },
                    home_alert_title,
                    "Yes, Cancel"
                );
                return false;
            }
        });
        $rootScope.$on('$locationChangeStart',
            function(event, toState, toParams, fromState, fromParams, $event) {
                Menu.active = false;
                console.log("location change start");
                // ABANDON REQUEST ONLY
                if(Request.numCompaniesCalled > 0 && toState.indexOf("step2") != -1) {
                    console.log(" -------------------- preventing default change on location start -------------------------");
                    event.preventDefault();
                    new xAlert(abandon_request,
                        function(button) {
                            if(button == 1) {
                                console.log(" -------------------- resetting request and changing path -------------------------");
                                Request.reset();
                                $state.go("step1");
                                $urlRouter.sync();
                            }
                            console.log(button);
                        },
                        abandon_request_title,
                        "Yes, Cancel"
                    );
                    return false;
                }
                // BACK BUTTON STEP 1 ONLY
                if(Request.id && toState.indexOf("step1") != -1) {
                    console.log(" -------------------- preventing default change on location change -------------------------");
                    event.preventDefault();
                    new xAlert("Returning to step 1 will cancel your current request. Continue?",
                        function(button){
                            if(button == 1){
                                console.log(" -------------------- resetting request and changing path -------------------------");
                                Request.reset();
                                $state.go("step1");
                                //$urlRouter.sync(); // not sure what this does at the moment
                            }
                            console.log(button);
                        },
                        "Leave this page?",
                        "Yes, Cancel"
                    );
                    return false;
                }
            }
        );

        $rootScope.$on('$locationChangeSuccess', function(){
            // only call if the event.preventDefault isn't active from the locationChangeStart
            Nav.reset();
        });

    }).filter('orderObjectBy', function() {
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
    });


myApp.filter('reverse', function() {
    return function(items) {
        return items.slice().reverse();
    };
});