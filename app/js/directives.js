'use strict';
/* Directives */

angular.module('myApp.directives', []).
	directive('appVersion', ['version', function(version) {
		return function(scope, elm, attrs) {
			elm.text(version);
		};
	}])
	.directive('loadMore', function(){
		return {
			restrict: 'EA',
			replace: true,
			scope: {
				eventHandler: '&ngClick'
			},
			template: '<div class="load-more btn btn-default btn-xs">Load More</div>'
		}
	})
	.directive('igLogin', ['User', function(User){
		return {
			restrict: 'EA',
			replace: true,
			scope: {
				eventHandler: '&ngClick'
			},
			controller : 'login',
			templateUrl: '/public_html/ngQuotogenic/app/partials/login.html'
		}
	}])
	.directive('ratingBar', ['User', function(User){
		return {
			restrict : 'EA',
			replace : true,
			scope : {
				photo : "=",
				photoMap : "@photoMap"
			},
			link : function(scope, element, attrs) {
				//console.log(scope);
				//scope.photo = { likes : 5, dislikes : 2};
				//scope.likes = 10;
				console.log(scope);
				console.log("PHOTO IS:", scope.photo);
			},
			controller : 'ratingBarController',
			templateUrl: '/public_html/ngQuotogenic/app/partials/ratingBar1.html'
		}
	}]);