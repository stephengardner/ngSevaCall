'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
	.controller('initialFeed', ['QuoteFactory', '$cookies', 'resolveQuotes', '$scope', '$stateParams', function(QuoteFactory, $cookies, resolveQuotes, $scope, $stateParams) {
		console.log("--------------------- resolveQuotes inside initialFeed ------------------------:", resolveQuotes);
		$scope.quoteFactory = QuoteFactory;
	}])
	.controller('popularFeed', ['resolveQuotes', '$scope', '$stateParams', function(resolveQuotes, $scope, $stateParams) {
		$scope.quoteFactory = resolveQuotes;
	}])
	.controller('sidebarOne', ['resolveTags', 'resolveAuthors', '$scope', function(resolveTags, resolveAuthors, $scope) {
		$scope.popularTags = resolveTags;
		$scope.popularAuthors = resolveAuthors;
	}])
	.controller('login2', ['User', 'QuoteFactory', 'AuthenticateService', '$scope', function(User, QuoteFactory, AuthenticateService, $scope) {
		var Authenticate = new AuthenticateService();
		
		// use window.Authenticate so that the instagram popup can close via the window's scope
		window.Authenticate = Authenticate;
		
		// set the USER
		$scope.user = User;
		
		$scope.logout = function(){
			window.Authenticate.logout(window.Authenticate.data.qac).then(function(){
				QuoteFactory.onUserReset();
			});
		};
		
		$scope.login = function() {
				window.Authenticate.login().then(function(d){
					QuoteFactory.onUserReset();
			});
		}
	}]);
