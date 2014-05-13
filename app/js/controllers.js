'use strict';

/* Controllers */
angular.module('myApp.controllers', [])
    .controller('test2', ['$scope', function(){

    }])
    .controller('test', ['$timeout', 'GoogleMap', 'User', 'Request', 'Times', 'Location', 'Overlay', 'Categories', '$scope', 'SCAPI', function($timeout, GoogleMap, User, Request, Times, Location, Overlay, Categories, $scope, SCAPI){
        /*
         User.setPhone("3017047437");
         User.setName("augie");
         User.setEmail("augie@augie.com");
         Request.setCategory("Test Spin");
         Request.description = "Augie is testing 1 2 3 4";
         User.setZipcode(20854);
         Times.buttons.now = 1;
         SCAPI.step1().then(function(d){
         console.log("got ", d);
         SCAPI.getCompaniesList().then(function(d){
         console.log("getCompaniesList:", d);
         SCAPI.searchAction3().then(function(d){
         console.log("Submitted Request, response:", d);
         });
         });
         });
         */
        $scope.companies = Request.companies;
        $scope.request = Request;
        /*
         $scope.yelpStarOffset = -4.25 + (companyRating * 12.5);
         $scope.citysearchStarOffset = -4.25 + (companyRating * 12.5);
         $scope.googleStarOffset = -4.25 + (companyRating * 12.5);
         $timeout(function(){
         console.log("ok");
         }, 5000);
         */
        Request.setID(112669);
        $scope.numCompaniesAccepted = Request.numCompaniesAccepted;
        console.log("Request is: ", Request);
        SCAPI.getCompaniesList().then(function(){
            Request.pingStatusesStart();
            GoogleMap.init();
        });
        //Request.pingStatusesStart();
        // $scope.statuses = Request.statuses;
        //Request.pingStatusesStop();

        /*
         SCAPI.getRequestStatus().then(function(d){
         $scope.Companies = Request.statuses;
         Request.pingStatusesStart();
         });
         */
    }])
    .controller('step1Controller', ['$state', '$q', '$location', 'SCAPI', 'Request', 'Categories', 'Overlay', 'User', '$scope', 'Location', function($state, $q, $location, SCAPI, Request, Categories, Overlay, User, $scope, Location) {
        $scope.User = User;
        $scope.Request = Request;
        if(!User.zipcode) {
            Location.geoLocate().then(function(d){
                $scope.User.setZipcode(d);
            });
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
            Overlay.add(1);
            Location.geoLocate().then(function(d){
                if(d) {
                    console.log("resovled to: ", d)
                    $scope.User.setZipcode(d);
                }
                else
                    console.log("d is false");
                Overlay.remove();
            });
        };

        $scope.next = function(){
            var deferred = $q.defer();
            Overlay.add(1);
            SCAPI.step1().then(function(d){
                console.log("aPI returned: ", d);
                Overlay.remove();
                deferred.resolve(d);
                if(d.indexOf("|") == -1) {
                    new xAlert(d);
                    return false;
                }
                $state.go("step2");
            });
            return deferred.promise;

        };
        $scope.categories = Categories;
    }])
    .controller('step2Controller', ['$timeout', 'SCAPI', 'Times', '$scope', 'User', 'Request', '$state', function($timeout, SCAPI, Times, $scope, User, Request, $state) {
        if(jQuery.isEmptyObject(Request.companies))
            SCAPI.getCompaniesList();
        console.log("STEP 2");
        $scope.Times = Times;
        $scope.Request = Request;
        $scope.timeButtonActive = Times.timesActive.length > 0;
        $scope.timetable = function(){
            console.log("clicked");
            $state.go('timetable');
        };
        $scope.next = function(){
            if(!Request.isDescriptionValid()){
                new xAlert("Description must be 7 words");
                return false;
            }
            if(User.isEmailValid() && User.isNameValid() && User.isPhoneValid()){
                new xAlert("Call companies now? You may receive up to three calls",
                    function(button) {
                        if(button == 2) {
                            Request.submit().then(function(){
                                $state.go("step3");
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
    .controller('step2aController', ['Storage', '$rootScope', 'User', 'Times', '$scope', 'Request', '$state', function(Storage, $rootScope, User, Times, $scope, Request, $state){
        var UserBackup = angular.copy(User);
        $scope.User = User;
        $scope.Times = Times;
        $scope.emailKeyup = function(d){
            d.stopPropagation();
            console.log(d);
        };
        var cleanUpFunction = $rootScope.$on('back', function(){
            console.log("------------------------- rootscope back --------------------------------");
            User.setName(UserBackup.getName());
            User.setEmail(UserBackup.getEmail());
            User.setPhone(UserBackup.getPhone());
        });
        $scope.$on('$destroy', function() {
            cleanUpFunction();
        });
        $scope.next = function(){
            if(!User.isEmailValid()) {
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
                if(Request.isDescriptionValid() && !Times.isEmpty()) {
                    new xAlert("Call companies now? You may receive up to three calls",
                        function(button) {
                            if(button == 2) {
                                Request.submit().then(function(){
                                    $state.go("step3");
                                });
                            }
                        },
                        "Alert",
                        "Cancel,Ok"
                    );
                }
                else {
                    $state.go("step2");
                }
            }
        }
    }])
    .controller('step3Controller', ['GoogleMap', 'Request', '$scope', function(GoogleMap, Request, $scope){
        $scope.companies = Request.companies;
        $scope.request = Request;
        GoogleMap.init();
        $scope.statuses = Request.statuses;
    }])
    .controller('bodyController', ['Menu', '$attrs', '$scope', function(Menu, $attrs, $scope){
        //$scope.Menu = Menu;

    }])
    .controller('menuController', ['$parse', '$attrs', '$scope', 'Menu', function($parse, $attrs, $scope, Menu){
        $scope.Menu = Menu;
    }])
    .controller('headerController', ['Request', '$rootScope', '$state', '$window', 'Menu', '$attrs', '$scope', function(Request, $rootScope, $state, $window, Menu, $attrs, $scope){
        $scope.back = function(){
            $rootScope.$broadcast('back');
            $window.history.back();
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
    }]);
	