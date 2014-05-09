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
			templateUrl: '/augie/ng/app/partials/header.html'
		}
	})
	.directive('actionButton', function(User){
		return {
			restrict: 'EA',
			replace: true,
            scope : {
                text: "="
            },
			templateUrl: '/augie/ng/app/partials/button.html'
		}
	})
	.directive('ratingBar', ['User', function(User){
		return {
			restrict : 'EA',
			replace : true,
			scope : {
				photo : "=",
				photoMap : "@photoMap",
				size : "="
			},
			link : function(scope, element, attrs) {
				console.log(scope);
				console.log("PHOTO IS:", scope.photo);
			},
			controller : 'ratingBarController',
			templateUrl: '/public_html/ngQuotogenic/app/partials/ratingBar.html'
		}
	}])
	.directive('quoteBlock', function(){
		return {
			restrict : 'EA',
			replace : true,
			scope : {
				quote : "=",
                options : "="
			},
			link : function(scope, element, attrs) {
			},
			controller : 'quoteBlockController',
			templateUrl: '/public_html/ngQuotogenic/app/partials/quoteBlock.html'
		}
	})
    .directive('scMenu', function(){
        return {
            restrict : 'EA',
            replace : true,
            controller : 'menuController',
            templateUrl: '/augie/ng/app/partials/menu.html'
        }
    })
    .directive('phoneInput', function(){
        return {
            restrict : 'EA',
            link : function(sc, el, at) {
                el.bind('keydown keypress', function(e){
                    /*console.log($(el).val());

                    if(sc.User.phone.length >= 10) {
                        e.preventDefault();
                        e.stopPropagation();
                    }*/
                });
            },
            replace : true,
            template: '<input id="phone" maxlength="10" type="phone" ng-model="User.phone"/>'
        }
    });
