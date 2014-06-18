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
            scope : {
                text: "=",
				clickfunction: "="
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
    /*
    .directive('testDirective', function() {
        return {
            restrict: 'E',
            template: '<div class="test-directive"><h1><div ng-transclude></div></h1></div>',
            replace: true,
            transclude: true,
            compile: function() {
                console.log("Compiling test-directive");
                return {
                    pre: function() { console.log("Prelink"); },
                    post: function() { alert("LINKED!"); }
                };
            }
        };
    })
    */
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