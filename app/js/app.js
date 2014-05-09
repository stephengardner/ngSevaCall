'use strict';
String.prototype.capitalize = function () {
    return this.toLowerCase().replace(/^.|\s\S/g, function (a) {
        return a.toUpperCase();
    });
};
// Declare app level module which depends on filters, and services
var myApp = angular.module('myApp', [
	'myApp.filters',
	'myApp.services',
	'myApp.directives',
	'myApp.controllers',
	'ui.router',
	'ngAnimate'
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
// UI-router config
.config(function($stateProvider, $urlRouterProvider) {

	// route to root if no valid route found
	$urlRouterProvider.otherwise('/step1');

	// home: an abstract route, load the home.html

    var step1 = {
        name : 'step1',
        url : '/step1',
        controller : 'step1Controller',
        templateUrl: '/augie/ng/app/partials/home.html'
    };
    console.log("States");
    var step2 = {
        name : 'step2',
        url : '/step2',
        controller : 'step2Controller',
        templateUrl: '/augie/ng/app/partials/step2.html',
        resolve : {
            resolveAPI : function(Overlay, $q, SCAPI, $location, Request){
                if(Request.id)
                    return true;
                var deferred = $q.defer();
                Overlay.add(1);
                SCAPI.step1().then(function(d){
                    if(d == "Invalid Location"){
                        $location.path("/");
                    }
                    console.log("aPI returned: ", d);
                    Overlay.remove();
                    deferred.resolve(d);
                });
                return deferred.promise;
            }
        }
    };
    var step3 = {
        name : 'step3',
        url : '/step3',
        controller : 'step3Controller',
        templateUrl: '/augie/ng/app/partials/step3.html'
    };
    var timetable = {
        name : 'timetable',
        url : '/timetable',
        controller : 'timeTableController',
        templateUrl: '/augie/ng/app/partials/timetable.html'
    };
    var step2a = {
        name : 'step2a',
        url : '/step2a',
        controller : 'step2aController',
        templateUrl: '/augie/ng/app/partials/step2a.html'
    };
    var settings = {
        name : 'settings',
        url : '/settings',
        controller : 'step2aController',
        templateUrl: '/augie/ng/app/partials/step2a.html'
    };
    var information = {
        name : 'information',
        url : '/information',
        controller : 'informationController',
        templateUrl: '/augie/ng/app/partials/information.html'
    };
	/*
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

	var photo = {
		name : 'photo',
		url : '^/photo/:id',
		parent : sidebar,
		views : {
			'content@home' : {
				templateUrl : '/public_html/ngQuotogenic/app/partials/photo.html',
				controller : 'photoController',
				resolve : {
					resolvePhotoMap : function(PhotoMap, AuthenticateService, $http, $q, $stateParams) {
						var deferred = $q.defer();
						PhotoMap.ping({ id : $stateParams.id}).then(function(d){deferred.resolve(d)});
						return deferred.promise;
					}
				}
			}
		}
	};
	
	// add all states to the app
	*/
    $stateProvider.state(step1);
    $stateProvider.state(step2);
    $stateProvider.state(step3);
    $stateProvider.state(timetable);
    $stateProvider.state(step2a);
    $stateProvider.state(settings);
    $stateProvider.state(information);
    /*
	$stateProvider.state(sidebar);
	$stateProvider.state(body);
	$stateProvider.state(filter);
	$stateProvider.state(photo);
	*/
}).run(function(SCAPI, Request, $rootScope, Menu){
    SCAPI.init(Request);
    $rootScope.$on('$stateChangeSuccess',
    function(event, toState, toParams, fromState, fromParams){
            Menu.active = false;
        console.log("State Change: State change success!");
    })
}).filter('orderObjectBy', function() {
        return function(items, field, reverse) {
            var filtered = [];
            angular.forEach(items, function(item) {
                filtered.push(item);
            });
            filtered.sort(function (a, b) {
                return (a[field] > b[field]);
            });
            if(reverse) filtered.reverse();
            return filtered;
        };
    });


myApp.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});