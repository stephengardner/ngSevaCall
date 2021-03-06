'use strict';
/* Directives */

angular.module('myApp.directives', []).
    directive('appVersion', ['version', function(version) {
        return function(scope, elm, attrs) {
            elm.text(version);
        };
    }])
    .directive('scHeader', [function(){
        return {
            restrict: 'EA',
            replace: true,
            controller : 'headerController',
            templateUrl: 'views/header.html'
        }
    }])
    .directive('actionButton', ['User', function(User){
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
            templateUrl: 'views/button.html'
        }
    }])
    .directive('scMenu', [function(){
        return {
            restrict : 'EA',
            replace : true,
            controller : 'menuController',
            templateUrl: 'views/menu.html'
        }
    }])
    .directive('phoneInput', [function(){
        return {
            restrict : 'EA',
            replace : true,
            template: '<input id="phone" maxlength="10" type="tel" ng-model="User.phone"/>'
        }
    }])
    .directive('ios7StatusBar', [function() {
        return {
            restrict : 'EA',
            replace : true,
            controller : 'ios7StatusBarController',
            templateUrl: 'views/statusBar.html'
        }
    }])
    .directive('scBlur', ['$parse', '$timeout', function($parse, $timeout) {
        return function(scope, element, attr) {
            var fn = $parse(attr['scBlur']);
            element.bind('blur', function(event) {
	            $timeout(function() {
		            // anything you want can go here and will safely be run on the next digest.
		            scope.$apply(function() {
			            fn(scope, {$event:event});
		            });
	            })
            });
        }
    }])
    .directive('scFocus', ['$parse', '$timeout', function($parse, $timeout) {
        return function(scope, element, attr) {
            var fn = $parse(attr['scFocus']);
            element.bind('focus', function(event) {
	            $timeout(function() {
		            // anything you want can go here and will safely be run on the next digest.
		            scope.$apply(function() {
			            fn(scope, {$event:event});
		            });
                })
            });
        }
    }])
	// allow phonegap links to open externally
	.directive('a', function(){
		return {
			restrict : 'EAC',
			link : function(scope, element, attrs) {
				if(isPhoneGap) {
					var href = attrs.href;
					element.on('click', function(e){
						window.open(href, "_system");
						e.preventDefault();
					})
				}
			}
		}
	})
	.directive('customValidation', ['User', function(User){
		return {
			require: 'ngModel',
			link: function(scope, element, attrs, modelCtrl) {
				modelCtrl.$parsers.push(function (inputValue) {
					var transformedInput = inputValue.toLowerCase().replace(/[a-zA-Z\s]*/g, '');
					if (transformedInput!=inputValue) {
						modelCtrl.$setViewValue(transformedInput);
						modelCtrl.$render();
					}
					return transformedInput;
				});
			}
		}
	}]);
