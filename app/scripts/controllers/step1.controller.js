
myApp.controller('step1Controller', ['App', '$scope', 'Location', 'User', 'Request', '$location', 'Categories', 'Overlay'
	, 'SCAPI', '$q', 'Splash', '$state', 'Track',
	function(App, $scope, Location, User, Request, $location, Categories, Overlay, SCAPI, $q, Splash, $state, Track) {
		Request.reset();
		$scope.app = App;
		$scope.isPhoneGap = isPhoneGap;
		$scope.Location = Location;
		$scope.User = User;
		$scope.Request = Request;

		$scope.$on('$viewContentLoaded', function() {
			if(!App.loaded) {
				App.loaded = true;
				if(isPhoneGap) {
					Splash.blip().then(function() {
					});
                    $("#phonegap-splash")[0].onload = function(){
						console.log("*--*Splash screen removed*--*");
                   		navigator.splashscreen.hide();
                    };
				}
			}
		});
		// on request category dropdown change
		$scope.change = function(){
			Track.event(2, "category_selected", true);
			for(var i = 0; i < $scope.categories.length; i++){
				if($scope.categories[i].id == Request.categoryID) {
					Request.setCategory($scope.categories[i].name);
				}
			}
			console.log("*Set Request category ID to:" + Request.categoryID);
			console.log("*Set Request category to:" + Request.category);
		};

		setTimeout(function(){
			document.getElementById("disabled").disabled = 'yes'
		}, 1);

		$scope.getLocation = function(){
			console.log("*scope.getLocation");
			Overlay.add(1);
			Location.geoLocate().then(function(d){
				console.log("Returned...");
				$scope.Location.busy = false;
				if(d) {
					$scope.User.setZipcode(d);
				}
				Overlay.remove();
			});
		};

		$scope.next = function(){
			if(skipAPICalls) {
				Request.setID(testRequestID);
				$state.go("step2");
				return;
			}
			var deferred = $q.defer();
			Overlay.add(1);
			console.log("SCAPI: ", SCAPI);
			SCAPI.step1().then(function(d){
				Overlay.remove();
				console.log("*Step 1 Returned: ", d);
				var results = d.split("|");
				// this API formats a response with a string format ("requestID|#####...|") if it is successful
				if(d.indexOf("requestID|") == -1) {
					var trackingEventByError = {
						'Invalid Service Category' : 'invalid_category_notification',
						'Invalid Location' : 'invalid_location_notification'
					};
					Track.event(3, 'alert_' + trackingEventByError[d]);
					Track.event('step1_service_search_delegate_failed');
					new xAlert(d);
					return false;
				}
				else {
					Track.event('step1_service_search_delegate_success');
					deferred.resolve(d);
					$state.go("step2");
				}
			});
			return deferred.promise;
		};

		// determines if we came to this page from the blog, if so, populate with a pre-filled category
		var categoryFromParams = $location.search().source;
		if(categoryFromParams) {
			for(var i = 0; i < Categories.length; i++) {
				if (Categories[i].name == categoryFromParams) {
					Request.categoryID = Categories[i].id;
				}
			}
			Request.setCategory(categoryFromParams);
		}

	}])