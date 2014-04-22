'use strict';


// Declare app level module which depends on filters, and services
var myApp = angular.module('myApp', [
	'ngRoute',
	'myApp.filters',
	'myApp.services',
	'myApp.directives',
	'myApp.controllers',
	'infinite-scroll',
	'ui.router',
	'ngProgress',
	'ngResource',
	'chieffancypants.loadingBar',
	'ngAnimate',
	'ngCookies'
]).config(function ($httpProvider) {
    $httpProvider.defaults.transformRequest = function(data){
        if (data === undefined) {
            return data;
        }
		console.log(data);
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
// laoding bar config
.config(function(cfpLoadingBarProvider) {
cfpLoadingBarProvider.includeSpinner = false;
})
// UI-router config
.config(function($stateProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise('/home');
	
	// home, currently an unused "/" route, but automatically authorizes a user before any action takes place down the chain
	var home = {
		name : 'home',
		url : '/',
		templateUrl: 'partials/home.html',
		resolve : {
			resolveAuthenticate : function(User, AuthenticateService, $q) {
				if(!User.id) {
					var auth = new AuthenticateService();
					window.Authenticate = auth;
					var deferred = $q.defer();
					auth.authenticate().then(function(){
					console.log("done auth");deferred.resolve(1)});
					return deferred.promise;
				}
			
			}
		}
	};
	
	// sidebar, load popular items
	var sidebar = {
		name : 'sidebar',
		url : '^/',
		parent : home,
		views : {
			'sidebar@home' : {
				templateUrl: 'partials/sidebarOne.html',
				controller : 'sidebarOne',
				resolve : {
					resolveTags : function(PopularFactory, $http, $q) {
						var deferred = $q.defer();
						var d = new PopularFactory("tag");
						d.nextPage().then(function(){console.log("Done sidebar");deferred.resolve(d);});
						return deferred.promise;
					},
					resolveAuthors : function(PopularFactory, $http, $q) {
						var deferred = $q.defer();
						var d = new PopularFactory("author");
						d.nextPage().then(function(){console.log("Done sidebar");deferred.resolve(d);});
						return deferred.promise;
					}
				}
			}
		}
	};
	
	// body, the feed and content body
	var body = {
		name : 'body',
		url : '^/home',
		parent : sidebar,
		views : {
			'content@home' : {
				templateUrl: 'partials/homeFeed.html',
				controller : 'initialFeed',
				resolve : {
					resolveQuotes : function(AuthenticateService, QuoteFilter, QuoteFactory, $http, $q) {
						var deferred = $q.defer();
						
						var auth = new AuthenticateService();
						auth.authenticate().then(function(){
							console.log("Absolute done auth");
							if(QuoteFactory.quotes.length == 0) {
								console.log("getting quotes");
								var d = QuoteFactory;
								d.nextPage().then(function(){
									deferred.resolve(d);
								});
							}
							else {
								var d = new QuoteFilter();
								d.reset().then(function(){
									deferred.resolve(d);
								});
							}
						});
						return deferred.promise;
					}
				}
			}
		}
	};
	
	// tag, the state for popular tags/authors
	var filter = {
		name : 'filter',
		url : '^/{type:tag|author}/:value',
		parent : sidebar,
		views : {
			'content@home' : {
				templateUrl: 'partials/homeFeed.html',
				controller : 'initialFeed',
				resolve : {
					resolveQuotes : function(AuthenticateService, QuoteFilter, $http, $q, $stateParams) {
						console.log("State Params:", $stateParams);
						var data = {};
						if($stateParams.type == "tag") {
							data = { tag : $stateParams.value };
						}
						if($stateParams.type == "author") {
							data = { author : $stateParams.value };
						}
						var deferred = $q.defer();
						var d = new QuoteFilter();
						d.filter(data).then(function(){
							deferred.resolve(d);
						});
						return deferred.promise;
					}
				}
			}
		}
	};
	
	// add all states to the app
	$stateProvider.state(home);
	$stateProvider.state(sidebar);
	$stateProvider.state(body);
	$stateProvider.state(filter);
});

myApp.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});