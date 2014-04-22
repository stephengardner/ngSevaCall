'use strict';
/* Services */
// Register the services:
angular.module('myApp.services', []);

// Retrieve Quotes based on current filter (or no filter), user interaction, etc.
myApp.factory('QuoteFactory', function(User, $rootScope, progress, $http, $q){
	$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
	var Quotes = {
		quotes : [], // all current quotes retrieved
		busy : false, // status indicator of http requests
		data : { page : 1, key : "tmp", type : "score", userID : User.data.id }, // data to GET or POST with http calls
		init : function() { // initialize with options, if available
			this.data = $.extend({}, this.data, opts);
		},
		
		// update the data attribute with the current User singleton userID
		updateUser : function() {
			this.data.userID = User.data.id
		},
		
		// run the next page of quotes, pings the quotogenic API based on the current page set in the global "data" object, as well as the other data params
		nextPage : function() {
			var self = this;
			self.updateUser();
			if (self.busy) return; // return if the http status is busy
			self.busy = true; // set the http status to busy
			var url = "../api/v2/feed?" + $.param(self.data); // create the url to ping
			var deferred = $q.defer(); // use Angular's $q API to set this function to return a promise, which will be fulfilled when $q is "reolve()d"
			self.data.pagesInclusive = 0; // nextPage() will never want all the inclusive quotes, only the next page.
			$http({
				url : url, 
				method : "GET", 
				headers : {'Content-Type': 'application/json'}
			}).
			success(function(d) {
				var items = d.data.quotes;
				// add all the retrieved quotes to the global quotes[] array
				angular.forEach(items, function(value, key) {
					self.quotes.push(value);
				});
				self.busy = false; // reset http status, allow future pings
				self.data.page++; // increase page for next ping
				deferred.resolve(self); // resolve the $q promise
			}).
			error(function(data){
				alert("err"); // testing, simply return an alert for now
			});
			return deferred.promise; // once the http callback has been fulfilled, this function returns the satisfied promise
		},
		
		// reset the global data object, perhaps we switched pages and want to go back to page 1
		reset : function() {
			this.data = { page : 1, key : "tmp", type : "score" };
		},
		
		// update the quotes all at once
		updateQuotes : function(quotes) {
			this.quotes = quotes;
		},
		
		// if a user logs in/out, update the quotes object instantly
		onUserReset : function() {
			var deferred = $q.defer();
			var self = this;
			var quotes = [];
			this.updateUser();
			self.data.pagesInclusive = 1;
			
			var url = "../api/v2/feed?" + $.param(self.data);
			console.log("--PING-- pinging the following: " + url);
			$http({
				url : url, 
				method : "GET", 
				headers : {'Content-Type': 'application/json'}
			}).
			success(function(d) {
				var items = d.data.quotes;
				angular.forEach(items, function(value, key) {
					quotes.push(value);
				});
				self.busy = false;
				self.updateQuotes(quotes);
				deferred.resolve(quotes);
			}).
			error(function(data){
				alert("err");
			});
			return deferred.promise;
		}
	};
	
	return Quotes
});

// Filter the quotes.  Remember, quotes is a singleton object with no use of the "new" keyword.
// however, a QuoteFilter can be instantiated and modifications to it will immediately reflect the Quote singleton in real time.
myApp.factory('QuoteFilter', function(User, QuoteFactory, $rootScope, progress, $http, $q){
	var QuoteFilter = function() {
		this.busy = false;
		this.quotes = [];
		this.data = { page : 1, key : "tmp", type : "score", userID : User.data.id };
	};
	QuoteFilter.prototype = {
			// update the data attribute with the current User singleton userID
		updateUser : function() {
			this.data.userID = User.data.id
		},
		
		reset : function() {
			var self = this;
			self.updateUser();
			QuoteFactory.reset();
			self.deferred = $q.defer();
			self.ping();
			return self.deferred.promise;
		},
		
		ping : function() {
			var self = this;
			var url = "../api/v2/feed?" + $.param(self.data);
			console.log("--PING-- pinging the following: " + url);
			$http({
				url : url, 
				method : "GET", 
				headers : {'Content-Type': 'application/json'}
			}).
			success(function(d) {
				angular.forEach(d.data.quotes, function(value, key) {
					self.quotes.push(value);
				});
				self.busy = false;
				self.data.page++;
				QuoteFactory.quotes = self.quotes;
				self.deferred.resolve(self);
			}).
			error(function(data){
				alert("err");
			});
		},
		
		filter : function(data) {
			var self = this;
			self.updateUser();
			this.data = $.extend({}, this.data, data);
			QuoteFactory.data = $.extend({}, this.data, data);
			if (this.busy) return;
			this.busy = true;
			self.deferred = $q.defer();
			
			self.ping();
			
			return self.deferred.promise;
		}
	};
	return QuoteFilter;
});

// Return list of popular tags/authors
myApp.factory('PopularFactory', function($http, $q){
	$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";

	var Popular = function(type, opts) {
		var type = type ? type : "tag";
		this.data = { page : 1, key : "tmp", type : type};
		
		this.data = $.extend({}, this.data, opts);
		
		this.quotes = [];
		this.busy = false;
		this.after = "";
		this.items = [];
	};
	
	Popular.prototype.nextPage = function() {
		var self = this;
		if (this.busy) return;
		this.busy = true;
		var url = "../api/v2/popular?" + $.param(self.data);
		var deferred = $q.defer();
		$http({
				url : url, 
				method : "GET", 
				headers : {'Content-Type': 'application/json'}
			}).
			success(function(d) {
				var items = d.data;
				angular.forEach(items, function(value, key) {
					self.items.push(value);
				});
				self.busy = false;
				self.data.page++;
				deferred.resolve(self);
			}).
			error(function(data){
				alert("err");
			});
		return deferred.promise;
	}
	
	return Popular
});

// authenticate the returning user, if they have an access cookie, log them in using their linked instagram account
myApp.factory("AuthenticateService", ['User', '$cookies', '$http', '$q', function(User, $cookies, $http, $q) {
	var Authenticate = function(opts) {
		this.test = "";
		this.link = "https://instagram.com/oauth/authorize/?client_id=75b6c945b4e04cb2982f25126e7add0f&redirect_uri=http://localhost/public_html/ngQuotogenic/app/instagram-redirect-handler.html&response_type=token&scope=relationships+likes";
		this.popup;
		this.data = { 
			key : "tmp", 
			access_token : "", 
			qac : $cookies.qac 
		};
		this.deferred = false;
		this.loginUrl = "../api/v2/login";
		this.logoutUrl = "../api/v2/logout";
		this.authenticateUrl = "../api/v2/authenticate";
	};
	
	Authenticate.prototype = {
		login : function() {
			this.deferred = $q.defer();
			this.popup = window.open(this.link,"mywindow","menubar=1,resizable=1,width=500,height=400");
			return this.deferred.promise;
		},
		
		logout : function(qac) {
			var self = this;
			this.deferred = $q.defer();
			$http.post("../api/v2/logout", { key : "tmp", qac : qac })
			.success(function(data, status, headers, config) {
				User.logout();
				self.deferred.resolve(data);
			}).error(function(data, status, headers, config) {
				self.deferred.resolve(data);
			});
			return this.deferred.promise;
		},
		
		processToken : function(access_token) {
			var self = this;
			this.data.access_token = access_token;
			$http.post(this.loginUrl, this.data)
			.success(function(data, status, headers, config) {
				try {
					User.login(data.data.data);
					self.deferred.resolve(data);
				}
				catch (e) {
					console.error("error on processing login token after HTTP success: ", e);
				}
			}).error(function(data, status, headers, config) {
				alert("err");
				self.deferred.resolve(data);
			});
		},
		
		closeWindow : function(){
			this.popup.close();
		},
		
		authenticate : function() {
			var self = this;
			this.deferred = $q.defer();
			$http.get(self.authenticateUrl + "?" + $.param(self.data))
			.success(function(data, status, headers, config) {
				self.response = data.data;
				// update the User singleton object with the supplied login data
				// if there was an actual data.data return value (a user object)
				if(data.data) 
					User.login(data.data);
				self.deferred.resolve(data);
			}).error(function(data, status, headers, config) {
				alert("err");
				self.deferred.resolve(data);
			});
			return this.deferred.promise;
		}
	};
	return Authenticate;
}]);

// The User singleton.  Cannot be instantiated.  Updates will reflect in real time
myApp.factory('User', function($rootScope, progress, $http, $q){
	var User = {
		data : {
			id : false,
			username : "",
			full_name : "",
			bio : "",
			qac : ""
		},
		
		login : function(opts) {
			try {
				this.data.id = opts.id;
				this.data.id = 35; // testing
				this.data.username = opts.username;
				this.data.full_name = opts.full_name;
				this.data.bio = opts.bio;
				this.data.qac = opts.qac;
			}
			catch (e) {
				console.error("Error on User login: ", e);
			}
		},
		
		logout : function() {
			this.data = {};
		}
	};
	return User;
});

// unused, menu item service
myApp.factory('menuService', ['$rootScope', function ($rootScope) {
	var service = {
		view: '../partials/partial2.html',

		MenuItemClicked: function (data) {
			$rootScope.$broadcast('menuitemclicked', data);
		}
	};
	return service;
}]);

// progress bar at top of page
myApp.service("progress", ["$rootScope", "ngProgress", function($rootScope, ngProgress){
	$rootScope.$on("event:endProgress", function(){
	  ngProgress.complete();
	});
	$rootScope.$on("event:startProgress", function(){
	  ngProgress.reset();
	})
}]);
