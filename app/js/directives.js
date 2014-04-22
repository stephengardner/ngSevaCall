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
			templateUrl: 'partials/login.html'
		}
	}]);
