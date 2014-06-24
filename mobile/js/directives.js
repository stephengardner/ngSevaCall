'use strict';
/* Directives */

angular.module('myApp.directives', []).
    directive('appVersion', ['version', function(version) {
        return function(scope, elm, attrs) {
            elm.text(version);
        };
    }])
    .directive('scHeader', function(){
        return {
            restrict: 'EA',
            replace: true,
            controller : 'headerController',
            templateUrl: 'partials/header.html'
        }
    })
    .directive('actionButton', function(User){
        return {
            restrict: 'EA',
            replace: true,
	        controller : "actionButtonController",
	        scope : {
		        text: "=",
		        clickfunction: "="
	        },
	        link : function(scope, element, attrs) {
		        element.bind("click", function(){
			        scope.click(scope.text);
		        });
	        },
            templateUrl: 'partials/button.html'
        }
    })
    .directive('scMenu', function(){
        return {
            restrict : 'EA',
            replace : true,
            controller : 'menuController',
            templateUrl: 'partials/menu.html'
        }
    })
    .directive('phoneInput', function(){
        return {
            restrict : 'EA',
            replace : true,
            template: '<input id="phone" maxlength="10" type="tel" ng-model="User.phone"/>'
        }
    })
    .directive('ios7StatusBar', function() {
        return {
            restrict : 'EA',
            replace : true,
            controller : 'ios7StatusBarController',
            templateUrl: 'partials/statusBar.html'
        }
    })
    .directive('scBlur', ['$parse', function($parse) {
        return function(scope, element, attr) {
            var fn = $parse(attr['scBlur']);
            element.bind('blur', function(event) {
                scope.$apply(function() {
                    fn(scope, {$event:event});
                });
            });
        }
    }])
    .directive('scFocus', ['$parse', function($parse) {
        return function(scope, element, attr) {
            var fn = $parse(attr['scFocus']);
            element.bind('focus', function(event) {
                scope.$apply(function() {
                    fn(scope, {$event:event});
                });
            });
        }
    }]);