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
	.directive('igLogin', function(){
		return {
			restrict: 'EA',
			replace: true,
			scope: {
				eventHandler: '&ngClick'
			},
			controller : 'login2',
			template: '\
				<div>\
					<div ng-click="login();" ng-cloak ng-show="!user.data.id" class="btn btn-primary ig-login">\
						Login with Instagram\
					</div>\
					<div ng-cloak ng-show="user.data.id">\
						<div ng-cloak class="btn btn-primary">\
							{{user.data.username}}\
						</div>\
						<div ng-click="logout(user.data.qac);" class="btn btn-info">\
							logout\
						</div>\
					</div>\
				</div>\
				'
		}
	});
