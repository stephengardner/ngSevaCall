'use strict';

// Declare app level module which depends on filters, and services
var myApp = angular.module('myApp', [
	'myApp.filters',
	'myApp.services',
	'myApp.directives',
	'myApp.controllers',
	'infinite-scroll',
	'ui.router',
	'ngResource',
	'chieffancypants.loadingBar',
	'ngAnimate',
	'ngCookies'
]).config(function ($httpProvider) {
    $httpProvider.defaults.transformRequest = function(data){
        if (data === undefined) {
            return data;
        }
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
	// route to root if no valid route found
	$urlRouterProvider.otherwise('/');
	
	// home: an abstract route, load the home.html
	var home = {
		name : 'home',
		url : '/',
		abstract : true,
		templateUrl: '/public_html/ngQuotogenic/app/partials/home.html'
	};
	
	// sidebar, load popular items
	var sidebar = {
		name : 'sidebar',
		url : '^/',
		abstract : true,
		parent : home,
		views : {
			'sidebar@home' : {
				templateUrl: '/public_html/ngQuotogenic/app/partials/sidebarOne.html',
				controller : 'sidebarOne',
				resolve : {
					resolveTags : function(PopularFactory, $http, $q) {
						var deferred = $q.defer();
						var d = new PopularFactory("tag");
						d.nextPage().then(function(){deferred.resolve(d);});
						return deferred.promise;
					},
					resolveAuthors : function(PopularFactory, $http, $q) {
						var deferred = $q.defer();
						var d = new PopularFactory("author");
						d.nextPage().then(function(){deferred.resolve(d);});
						return deferred.promise;
					}
				}
			}
		}
	};
	
	// body, the feed and content body
	var body = {
		name : 'body',
		url : '^/',
		parent : sidebar, // require the sidebar for this view
		views : {
			'content@home' : {
				templateUrl: '/public_html/ngQuotogenic/app/partials/homeFeed.html',
				controller : 'initialFeed',
				resolve : {
					resolveQuotes : function(AuthenticateService, QuoteFilter, QuoteFactory, $http, $q) {
						var deferred = $q.defer();
						
						var auth = new AuthenticateService();
						auth.authenticate().then(function(){
							if(QuoteFactory.quotes.length == 0) {
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
	
	// filter, the state for filtering quotes by tag/quthor 
	var filter = {
		name : 'filter',
		url : '^/{type:tag|author}/:value',
		parent : sidebar,
		views : {
			'content@home' : {
				templateUrl: '/public_html/ngQuotogenic/app/partials/homeFeed.html',
				controller : 'initialFeed',
				resolve : {
					resolveQuotes : function(AuthenticateService, QuoteFilter, $http, $q, $stateParams) {
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