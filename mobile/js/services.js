'use strict';
/* Services */
// Register the services:
angular.module('myApp.services', []);

// keep track of whether the app has loaded step 1 or not
// this is needed to check on step1's viewcontentloaded if we should blip() and init recording, etc.
myApp.factory('App', function() {
   var App = {
       loaded : false
   };
   return App;
});

// keep track of if the initial animation has processed
myApp.factory('AnimationService', function() {
    var AnimationService = {
        initialized : false,
        init : function() {
            this.initialized = true;
        }
    };
    return AnimationService;
});

// the modal window that will pop up on mobile phones that tells the user that they can click the recording button
// to record audio
myApp.factory('RecordingModal', function(Storage, $timeout){
    var RecordingModal = {
        active : false,
		removing : false,
		removed : false,
		hasBeenActive : false,
		message : "Click here to record your description.",
        show : function(){
            // only show the message once a session
            // this IF statement may be added or removed, if active, 
			// it will never show the message again to the user
			// once the user dismisses the modal
			//if(!Storage.recordingModalDismissed) {
			if(!this.hasBeenActive)
				this.active = true;
            //}
			this.hasBeenActive = true;
        },
        hide : function() {
            // set the recording modal dismissal notice to never appear again
			var self = this;
			self.removing = true;
            self.active = false;
			
			$timeout(function(){
				self.removed = true;
			}, 500);
			
            Storage.recordingModalDismissed = true;
            Storage.set();
        }
    };
    return RecordingModal;
});
myApp.factory('AlertSwitch', function(){
	var AlertSwitch = {
    	on : true,
        turnOff : function() {
        	this.on = false;
        },
        turnOn : function() {
        	this.on = true;
        }
    };
    return AlertSwitch;
});
myApp.factory('Track', function() {
	var GA_IDs = {
        'Seva Call Mobile App' : 'UA-51774414-1'
    };
    var Track = {
    	init : function() {
        	if(window.localStorage) {
                var clientId = window.device && window.device.uuid ? window.device.uuid : 1; // 1 = web, fix this for storage?
                ga(
                    'create',
                    GA_IDs['Seva Call Mobile App'],
                    {
                        'storage' : 'none',
                        'clientId' : window.localStorage.getItem('clientId')
                    }
                );
                ga(function(tracker) {
                    window.localStorage.setItem('ga_clientId', tracker.get('clientId'));
                });
            }
            else {
                ga('create',  GA_IDs['Seva Call Mobile App'], 'www.sevacall.com');
            }
            ga('send', 'pageview', {'page' : 'step1'});
        },
        defaults : {
        	event : {
            	hitType : 'event',
            	eventCategory : 'sc-action',
                eventAction : 'none'
            }
        },
        page : function(p) {
        	ga('send', {
            	'hitType' : 'pageview',
                page : p
            });
        },
        merge : function(params) {
        
        },
        event : function(options) {
        	var defaults = this.defaults.event;
            var options = options || {};
            var actual = $.extend({}, defaults, options);
            actual.eventAction = actual.eventAction.toUpperCase();
        	ga('send', actual);
        }
    };
    return Track;
});
myApp.factory('MapLoader', function($window, $q){
	var MapLoader = {
    	busy : false,
        loaded : false,
        loadMaps : function(){
        	var self = this;
        	self.deferred = $q.defer();
            if(self.busy) {
            	console.log("*loadMaps was busy, waiting...");
            	self.deferred.reject();
            }
            else if(self.loaded) {
            	console.log("*loadMaps was loaded, resolving");
                self.deferred.resolve();
            }
            else {
				self.busy = true;
                $window.loadMapsPlugins = function(){
                    $.getScript("js/infobox.js").done(function(){
                        $.getScript("js/xMarker.js").done(function(){
							self.loaded = true;
							self.busy = false;
                            self.deferred.resolve(true);
                            //Location.geoLocate();
                        }).fail(function() {
                        	self.busy = false;
                        	console.log("*getScript xMarker failed");
                            self.deferred.reject(false);
                            //Location.geoLocate();
                        });
                    }).fail(function(){
                        console.log("*getScript infoBox failed");
                        self.busy = false;
                        self.deferred.reject(false);
                        //Location.geoLocate();
                    });
                };
                $.getScript("http://maps.google.com/maps/api/js?v=3.13&key=AIzaSyBHtVxQeYDw2uzrMXpbkqnfqkftcjo-B3Y&sensor=false&callback=loadMapsPlugins").done(function(script, textStatus) {
                	console.log("*Get google maps textStatus is: " + textStatus);
                    if (typeof google !== 'object' && typeof google.maps !== 'object') {
                    	self.deferred.reject(false);
                    }
                }).fail(function(){
                	self.busy = false;
                    self.deferred.reject(false);
                });

            }
            return self.deferred.promise;
        }
        
    };
    return MapLoader;
});

myApp.factory('Splash', function($q) {
	var Splash = {
    	intervalLength : 400,
    	images : {
            iphone4 : 	[
                        'img/splash-iphone4-1.jpg',
                        'img/splash-iphone4-2.jpg',
                        'img/splash-iphone4-3.jpg',
                        'img/splash-iphone4-4.jpg'
                        ],
            iphone5 : 	[
                        'img/splash-iphone5-1.jpg',
                        'img/splash-iphone5-2.jpg',
                        'img/splash-iphone5-3.jpg',
                        'img/splash-iphone5-4.jpg'
                        ]
        },
        remove : function() {
            clearInterval(this.blipInterval);

            if(navigator.splashscreen) {
                navigator.splashscreen.hide();
            }
            
            $("#splashscreen").hide();
        },
        blip : function() {
            var deferred = $q.defer();
            var splash, blipImages;
            var index = 0;
            var self = this;
			if(device && device.platform == "iOS") {
				if(screen.height <= 480) { // iphone 4 == 480
					splash = document.getElementById("splashImg-iPhone4");
					blipImages = this.images.iphone4;
				}
				else {
					splash = document.getElementById("splashImg-iPhone5");
					blipImages = this.images.iphone5;
				}
				splash.style.left = 0;
				this.blipInterval = setInterval(function() {
					if( index == 0 ) {
						splash.src=blipImages[0];
						if(navigator.splashscreen)
							navigator.splashscreen.hide();
					}
					else if( index == blipImages.length ) {
						self.remove();
						deferred.resolve(true);
					}
					else {
						splash.src=blipImages[index];
					}
					index++;
				}, self.intervalLength);
			}
			else {
				navigator.splashscreen.hide();
				self.remove();
				deferred.resolve(true);
			}
            return deferred.promise;
        }
    };
    return Splash;
	
});

myApp.factory('Nav', function(){
    var Nav = {
        direction : "back",
        reset : function() {
            this.direction = "back";
        }
    };
    return Nav;
});

myApp.factory('Menu', function($timeout){
    var Menu = {
        active : false,
        busy : false,
        toggle : function(){
            var self = this;
            // A busy check is necessary, because if the menu is toggled twice rapidly, future animations would fail.
            // Must be a problem with Angular's animation checking but I could not pinpoint it.
            if(self.busy)
                return;
            $timeout(function(){
                self.busy = false;
            }, 500);
            self.busy = true;
			var forceCSSRepaint = $("#menu")[0].offsetHeight;
			if(self.active)
				self.close();
			else 
				self.active = true;
        },
        close : function(){
            var self = this;
			if(!self.active) {
				return;
			}
            self.busy = true;
            $timeout(function(){
                self.busy = false;
            }, 500);
            this.active = 0;
        }
    };
    return Menu;
});

myApp.factory('Ratings', function(Request){
    var Ratings = {
        getRating : function(company){
            var url = api_root + 'api/mobile/v2/getRating.php?source=' + source + '&companyName=' + encodeURIComponent(company.name) + '&companyZipcode=' + encodeURIComponent(company.zip) + '&companyPhone=' + encodeURIComponent(company.phone);
        }
    };
    return Ratings;
});

myApp.factory('GoogleMap', function($timeout, $q, Request){
    var GoogleMap = {
        bounds : [],
        latLngList : [],
        init : function(){
            var self = this;
            function getLatLongByZip(callback) {
                var deferred = $q.defer();
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({ 'address': "20854" }, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        deferred.resolve(results[0].geometry.location);
                    }
                });
                return deferred.promise;
            };
            function initialize() {
                var deferred = $q.defer();
                getLatLongByZip().then(function(d){
                    var mapOptions = {
                        center: d,
                        zoom: 8
                    };
                    self.map = new google.maps.Map(document.getElementById("map_canvas"),
                        mapOptions);
                    Request.GoogleMap = self;
                    // remove the automatic google map styling including roboto font
                    google.maps.event.addListener(self.map, 'idle', function () {
                        $('style').remove();
                    });
                    deferred.resolve(true);
                });
                return deferred.promise;
            }
            initialize().then(function(){
                self.mapFitBounds();
                self.addMarkers();
            });
        },

        mapFitBounds: function () {
            var self = this;

            self.LatLngList = new Array();
            self.bounds = new google.maps.LatLngBounds();
            for (var p in Request.companies) {
                var newLatLng = new google.maps.LatLng(Request.companies[p].lat, Request.companies[p].lon);
                self.LatLngList.push(newLatLng);
                self.bounds.extend(newLatLng);
            }

            // only allow a maximum zoom level
            var maxZoom = 10;
            self.map.initialZoom = true;
            google.maps.event.addListener(self.map, 'zoom_changed', function() {
                var zoomChangeBoundsListener =
                    google.maps.event.addListener(self.map, 'bounds_changed', function(event) {
                        if (this.getZoom() > maxZoom && this.initialZoom == true) {
                            // Change max/min zoom here
                            this.setZoom(maxZoom);
                            this.initialZoom = false;
                        }
                        google.maps.event.removeListener(zoomChangeBoundsListener);
                    });
            });

            self.map.fitBounds(self.bounds);
        },

        setInfoBox: function (companyObj) {
            var self = this;
            var icon = "";
            var companyName = companyObj.name;
            var companyStatus = companyObj.status;
            var nameOrStatus = companyObj.name;
            var shortAddrOrLongAddr = companyObj.city + ", " + companyObj.state;
            var secondRow;

            if (companyObj.status == "none") {
                secondRow = "";
            }
            else {
                secondRow = "<div class='SCMapInfoBox-company'>" + companyName + "</div>";
            }
            if (companyObj.status != "none") {
                icon = '			<div class="SCMapInfoBox-icon ' + companyObj.status.toLowerCase().replace(" ", "") + '">	';
                icon += '			</div>';
                nameOrStatus = companyObj.status;
            }
            else {
                nameOrStatus = companyObj.name;
            }
            // aware that this is not the ideal angular way of doing things.  However, imported this from old code base and works flawless for now
            var infoBoxContent = '\
									<table class="SCMapInfoBox clearfix">\
										<tbody>\
											<tr>\
												<td>\
													' + icon + '\
												</td>\
												<td>\
													<div class="SCMapInfoBox-status">\
														' + nameOrStatus + '\
													</div>\
													' + secondRow + '\
													<div class="SCMapInfoBox-location">\
														' + shortAddrOrLongAddr + '\
													</div>\
												</td>\
											</tr>\
										</tbody>\
									</table>\
									';
            var infoBoxDimensions = self.getInfoBoxDimensions(infoBoxContent);
            var infoBoxWidth = infoBoxDimensions[0];
            var infoBoxHeight = infoBoxDimensions[1];
            var infoBoxHeightOffset = 0;

            if (companyObj.status == "none")
                infoBoxHeightOffset = -100;
            else
                infoBoxHeightOffset = -115;

            var infoBoxOffset = (104 - ((infoBoxWidth) / 2));

            self.infoBox.setOptions({
                disableAutoPan: true,
                boxStyle: {
                    "whiteSpace": "nowrap"
                },
                content: infoBoxContent,
                zIndex: null,
                pixelOffset: new google.maps.Size(infoBoxOffset, infoBoxHeightOffset),
                infoBoxClearance: new google.maps.Size(-80, 50),
                isHidden: false,
                enableEventPropagation: false

            });

            self.infoBox.open(self.map, companyObj.marker);
            var loc = self.infoBox.getPosition();

            google.maps.Map.prototype.panToWithOffset = function (latlng, offsetX, offsetY) {
                var map = this;
                var ov = new google.maps.OverlayView();
                ov.onAdd = function () {
                    var proj = this.getProjection();
                    var aPoint = proj.fromLatLngToContainerPixel(latlng);
                    aPoint.x = aPoint.x + offsetX;
                    aPoint.y = aPoint.y + offsetY;
                    map.panTo(proj.fromContainerPixelToLatLng(aPoint));
                };
                ov.draw = function () {
                };
                ov.setMap(this);
            };
            self.map.panToWithOffset(loc, 0, -30);
        },
        
        getInfoBoxDimensions: function (content) {
            var sensor = $("<div>").html(content);
            $(sensor).appendTo("body").css({"position": "absolute", "left": "-9999px", "top": "-9999px"});
            var width = $(sensor).width();
            var height = $(sensor).height();
            $(sensor).remove();
            return new Array(width, height);
        },
        
        addMarkers : function(){
            var self = this;
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(-25.363882,131.044922),
                map: self.map,
                title:"Hello World!"
            });
            self.infoBox = new InfoBox();
            for (var p in Request.companies) {
                console.log("*Setting marker for company: " + Request.companies[p].name + " at (" + Request.companies[p].lat + ", " + Request.companies[p].lon + ")");

                Request.companies[p].marker = new xMarker(new google.maps.LatLng(Request.companies[p].lat, Request.companies[p].lon), self.map, Request.companies[p], Request.companies[p].markerNumber);
                google.maps.event.addListener(Request.companies[p].marker, "click", function () {
                    self.setInfoBox(this.company);
                });
            }

            // self.mapFitBounds();
            document.addEventListener("click", function () {
                self.infoBox.close();

            }, true);
        }
    };
    return GoogleMap;
});

myApp.factory('Times', function(){
    var Times = {
        timesActive : [],
        timesInactive : [],
        buttons : {},
        dates : [],
        hourOfDay : new Date().getHours(),
        year : new Date().getFullYear(),
        init : function(){
            this.setDays();
        },
        
        postify : function(){
            var times = "";
            if(this.buttons.now){
                times += ("&box41=now");
            }
            else if(this.buttons.anytime){
                times += ("&box41=anytime");
            }
            for(var i = 0; i < this.timesActive.length; i++){
                var boxNumber = this.timesActive[i].replace("-", "").split("").reverse().join("");
                var dateStringIndex = boxNumber[1] - 1;
                times += ("&box" + boxNumber + "=" + this.dates[dateStringIndex].toString);
            }
            return times;
        },

        isFull : function(){
            var isNowActive = this.buttons.now ? 1 : 0;
            return this.timesActive.length + isNowActive >= 5;
        },

        fullAlert : function(){
            new xAlert("Please select a maximum of 5 times");
        },

        isEmpty : function() {
            var self = this;
            function emptyButtons() {
                for(var i in self.buttons){
                    if(self.buttons[i] != false) {
                        return false;
                    }
                }
                console.log("true");
                return true;
            }
            return (this.timesActive.length == 0 && emptyButtons());
        },

        empty : function() {
            this.buttons = {};
            this.timesActive = [];
            return this;
        },

        changeTime : function(time){
            if(time == "now" && this.buttons['anytime'] == 1){
                this.buttons['anytime'] = 0;
            }
            if(time == "now" && this.isFull() && !this.buttons.now) {
                this.fullAlert();
                return false;
            }
            if(time == "pick_time") {
                this.buttons['pick_time'] = 1;
                this.buttons['anytime'] = 0;
                return true;
            }
            this.buttons[time] = !this.buttons[time];
            if(time == "anytime" && this.buttons['anytime'] == 1) {
                this.empty();
                this.buttons = { anytime : 1 };
            }
            if(time == "pick_time" && this.buttons['pick_time'] == 1)
                this.buttons.anytime = 0;
        },

        find : function(row, col){
            return this.timesActive.indexOf(row + "-" + col) != -1;
        },

        findInactive : function(row, col) {
            return this.timesInactive.indexOf(row + "-" + col) != -1;
        },

        setDays : function(){
            var self = this;
            var today = new Date();
            var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

            function pad(num, size) {
                var s = num+"";
                while (s.length < size) s = "0" + s;
                return s;
            }

            for (var i = 0; i < 7; i++) {
                var currentDate = new Date();
                currentDate.setDate(today.getDate() + i);
                var dayShort = days[(currentDate.getUTCDay())];
                var dateNumber = pad(currentDate.getUTCDate(), 2);
                var monthNumber = pad(currentDate.getUTCMonth() + 1, 2);
                var newDate = {
                    'day' : dayShort,
                    'date' : dateNumber,
                    'month' : monthNumber,
                    'toString' : this.year + "-" + monthNumber   + "-" + dateNumber };
                self.dates.push(newDate);
            }

            if (self.hourOfDay >= 11)
                self.timesInactive.push("1-1");
            if (self.hourOfDay >= 15)
                self.timesInactive.push("1-2");
            if (self.hourOfDay >= 19)
                self.timesInactive.push("1-3");
        },

        toggleTime : function(row, col) {
            if(this.findInactive(row,col)) {
                return false;
            }
            console.log("*Toggling time:" + row + "-" + col);
            var index = this.timesActive.indexOf(row + "-" + col);
            if(index == -1 && !this.isFull()) {
                this.timesActive.push(row + "-" + col);
            }
            else if(index == -1 && this.isFull()) {
                // alert - full
                this.fullAlert();
                return false;
            }
            else {
                this.timesActive.splice(index, 1);
                if(this.timesActive.length == 0) {
                    this.buttons['pick_time'] = false;
                }
            }
        }
    };
    Times.init();
    return Times;
});

myApp.factory('Request', function(Recording, $rootScope, SCAPI, $interval, /*User,*/ $http, $q, Times, Uploader){
    var Request = {
        initialized : false,
        companies : {},
        statuses : [],
        statusThrottle : [],
        numCompaniesAccepted : 0,
        numCompaniesCalled : 0,
        numCompaniesRejected : 0,
        processing : false,
        complete : false,

        isDescriptionValid : function(){
            if(this.description) {
                var word = /\b[^\s]+\b/g;
                var matches = this.description.match(word);
                if(matches && matches.length >= 7 && self.description != "Describe what you need help with in as much detail as possible...")
                    return true;
            }
            return false;
        },
		
        // when a user travels back to step 1, reset all necessary parameters
        reset : function() {
            Times.empty();
            /*
			Recording.reset();
			Uploader.reset();
			*/
            this.pingStatusesStop();
            this.verifiedTimeoutStop();
            this.description = "";
            this.id = false;
            this.statuses = [];
            this.statusThrottle = [];
            this.numCompaniesCalled = 0;
            this.numCompaniesRejected = 0;
            this.numCompaniesAccepted = 0;
            this.companies = {};
            this.processing = false;
            this.complete = false;
        	//SCAPI.init(Request);
        },

        addCompany : function(){
        },

        getID : function(){
            return this.id;
        },

        getCompanies : function(){
            return this.companies;
        },

        getStatus : function(){
            return this.status;
        },

        getDescription : function(){
            return this.description;
        },

        setID : function(id){
            this.id = id;
        },
		
        // the timeout that will trigger if a request does not have any updated statuses after 60 seconds or 15 minutes
        verifiedTimeoutStart : function() {
            var self = this;
            self.timeSpentWaiting = 0;
            self.verifiedTimeout = $interval(function(){
                self.timeSpentWaiting++;
                if(self.timeSpentWaiting == 60) {
                    new xAlert("To ensure the highest quality matches your request needs to be verified, which may take up to 15 minutes. If you need service right away please call us at 1-877-987-SEVA (7382)");
                }
                else if(self.timeSpentWaiting == (15 * 60)) {
                    new xAlert("We're sorry, but your request was unsuccessful.  If you still need service you may try again, or call us at 1-877-987-SEVA (7382)");
                }
            }, 1000);
        },

        verifiedTimeoutStop : function() {
            this.timeSpentWaiting = 0;
            $interval.cancel(this.verifiedTimeout);
        },
		
        setRequestStatusOverride : function(statusList) {
        	var self = this;
            
            if(statusList == -1) {
            	self.requestStatusOverride = 0;
            }
            else {
            	self.requestStatusOverride = $.parseJSON(statusList);
            }
        },
        
        pingStatusesStart : function() {
            var self = this;
			/*
            Request.processing = true;
            self.verifiedTimeoutStart();
            self.interval = $interval(function() {
                SCAPI.getRequestStatus().then(function(d) {
                    self.setStatusThrottle(d);
                    if(self.statusThrottle.length > 0 && !$.isEmptyObject(self.companies)) {
                        self.verifiedTimeoutStop();
                        var status = self.statusThrottle[0];
                        if(status.companyID != 0) {
                            status.companyName = Request.companies[status.companyID].name;
                            status.location = Request.companies[status.companyID].city + ", " + Request.companies[status.companyID].state;
                            status.rel = Request.companies[status.companyID].markerNumber;
                            status.iconClass = status.requestStatusShort.toLowerCase().replace(" ", "");
                            Request.companies[status.companyID].status = status.requestStatusShort;
                            self.statuses.unshift(status); // add it to the front so that angular pushes it to the front of the html list
                            //Request.companies[status.companyID].accepted = 1;
                            if(status.requestStatusShort == "Calling") {
                                Request.numCompaniesCalled++;
                            }
                            if(status.requestStatusShort == "Declined") {
                                Request.numCompaniesRejected++;
                            }
                            if(status.requestStatusShort == "Accepted") {
                                SCAPI.getRatings(Request.companies[status.companyID]).then(function(d){
                                    console.log("*All ratings for company have been retrieved");
                                });
                                Request.companies[status.companyID].accepted = 1;

                                Request.companies[status.companyID].acceptedOrder = self.numCompaniesAccepted;
                                self.numCompaniesAccepted++;
                            }
                            console.log(status.requestStatusShort);
                            self.statusThrottle.shift();
                            
                            try {
                            	self.GoogleMap.setInfoBox(Request.companies[status.companyID]);
                            } catch(e) {
                            	// if the google map is not defined yet, it means the transition hasn't or will not happen
                                
                            }
                        }
                        else {
                            // if companyID is 0, its completed
                            self.requestComplete();
                            self.pingStatusesStop();
                        }
                    }
                    console.log("*The current throttle is: ", self.statusThrottle);
                });
            }, 1000);
			*/
        },

        requestComplete : function() {
            //$rootScope.$broadcast('requestCompleted');
            this.complete = true;
        },

        pingStatusesStop : function() {
            Request.processing = false;
            $interval.cancel(this.interval);
        },

        submit : function() {
			/*
            var self = this;
            var deferred = $q.defer();
            //
            if(testing)
                this.setID(112669);
              
            SCAPI.searchAction3().then(function(d){
                Request.pingStatusesStart();
                deferred.resolve(d);
            });
            return deferred.promise;
			*/
        },

        setStatusThrottle : function(statusResponse) {
            function statusIDIsIn(requestStatusID, arrayOfObjects){
                for(var i = 0; i < arrayOfObjects.length; i++){
                    var obj = arrayOfObjects[i];
                    if(obj.requestStatusID == requestStatusID) {
                        return true;
                    }
                }
                return false;
            };

            for(var i = 0; i < statusResponse.length; i++){
                var status = statusResponse[i];
                if(!statusIDIsIn(status.requestStatusID, this.statusThrottle) && !statusIDIsIn(status.requestStatusID, this.statuses)){
                    this.statusThrottle.push(status);
                }
            }
        },

        setCompanies : function(companies) {
            this.companies = companies;
        },

        setCategory : function(category) {
            this.category = category;
        },

        setStatus : function(status){
            this.status = status;
        },

        setDescription : function(description){
            this.description = description;
        }
    };
    return Request;
});

myApp.factory('Storage', function(User, Request, $localStorage){
    var Storage = {
        name : false,
        email : false,
        phone : false,
        zip : false,
        recordingModalDismissed : false,

        saveUser : function(){
            this.name = User.name;
            this.email = User.email;
            this.phone = User.phone;
            this.set();
        },

        import : function() {
            User.name = $localStorage.sc_user_name;
            User.email = $localStorage.sc_user_email;
            User.phone = $localStorage.sc_user_phone;
            User.zip = $localStorage.sc_user_zip;
            this.name = $localStorage.sc_user_name;
            this.email = $localStorage.sc_user_phone;
            this.phone = $localStorage.sc_user_phone;
            this.zip = $localStorage.sc_user_zip;
            this.recordingModalDismissed = $localStorage.sc_recordingModalDismissed;
        },

        saveZip : function() {
            this.zip = User.zipcode;
            this.set();
        },

        set : function() {
            $localStorage.sc_user_name = this.name;
            $localStorage.sc_user_email = this.email;
            $localStorage.sc_user_phone = this.phone;
            $localStorage.sc_user_zip = this.zip;
            $localStorage.sc_recordingModalDismissed = this.recordingModalDismissed;
        },

        empty : function() {
            $localStorage.$reset();
        }
    };
    return Storage;
});

myApp.factory('User', function(){
    var User = {
        nameValidate : /[a-zA-Z]{2,}/,
        emailValidate : /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i,
        phoneValidate : /^((\([\d]{3}\))( [\d]{3}-))[\d]{4}|^[\d]{10}$/,

        // getters
        getCategory : function(){
            return this.category;
        },
        getCategoryID : function(){
            return this.categoryID;
        },
        getZipcode : function(){
            return this.zipcode();
        },
        getName : function(){
            return this.name;
        },
        getPhone : function(){
            return this.phone;
        },
        getEmail : function(){
            return this.email;
        },

        // setters
        setCategory : function(category){
            this.category = category;
        },
        setCategoryID : function(categoryID){
            this.categoryID = categoryID;
        },
        setZipcode : function(zipcode){
            this.zipcode = zipcode;
        },
        setName : function(name){
            this.name = name;
        },
        setPhone : function(phone){
            this.phone = phone;
        },
        setEmail : function(email){
            this.email = email;
        },

        // validation
        isNameValid : function() {
            return this.name && this.nameValidate.test(this.getName());
        },

        isEmailValid : function() {
            return this.emailValidate.test(this.getEmail());
        },

        isPhoneValid : function() {
            return this.phoneValidate.test(this.getPhone());
        }

    }
    return User;
});

myApp.factory('Overlay', function(){
    var Overlay = {
        body : $("body"),
        isActive : false,
        isActiveWithSpinner : false,
        overlaySpinner : $("<div class='overlay-spinner'><img src='" + root + "img/ajax_loader.gif'/><div class='overlay-text-wrapper'><div class='overlay-text hidden'></div></div></div>"),
        overlayBackground : $("<div class='overlay'></div>"),
        add : function(opt_spinner, opt_message) {
            if(opt_spinner && !this.isActiveWithSpinner) {
                this.isActiveWithSpinner = true;
                this.isActive = true;
                this.body.append($(this.overlayBackground).append(this.overlaySpinner));
            }
            else if(!this.isActive){
                this.isActive = true;
                this.body.append(this.overlayBackground);
            }
            else if(this.isActive && !opt_spinner){
                this.isActiveWithSpinner = false;
                this.overlaySpinner.remove();
            }
        	if(opt_message) {
            	this.message(opt_message);
            }
            return this;
        },
        
        remove : function() {
        	$(".overlay-text").html("").addClass("hidden");
            this.isActive = this.isActiveWithSpinner = false;
            this.overlayBackground.remove();
            this.overlaySpinner.remove();
            return this;
        },
        
        // add a message beneath the spinner
        message : function(text) {
            // for the message function, always add the overlay with spinner
            if(!this.isActiveWithSpinner){
                this.add(1);
            }
        	$(".overlay-text").html(text).removeClass("hidden");
            return this;
        }
    };
    return Overlay;
});

myApp.factory('Location', function(User, $q, $http, Overlay, $timeout, $window, MapLoader) {
    var Location = {
        busy : false,
        complete : function() {
        	Overlay.remove();
        	console.log("removing busy status from complete");
            this.busy = false;
        },
        error : function(err) {
        	console.log("removing busy status from err");
            this.busy = false;
            Overlay.remove();
            // if there's a location error when we first check on startup, don't show the error.  This can get annoying
            if(!this.opt_initial_check)
            	new xAlert("Unable to obtain location");
        },
        geoLocate : function(opt_initial_check) {
            var self = this;
            self.busy = true;
            if(!opt_initial_check)
            	Overlay.message("Locating...");
            self.opt_initial_check = opt_initial_check;
        	var deferred = $q.defer();
            var preloadDeferred = $q.defer();
            function preload() {
                MapLoader.loadMaps().then(function(){
                    console.log("all loaded");
                    preloadDeferred.resolve(true);
                }, function(){
                    console.log("not loaded");
					if(opt_initial_check) {
						preloadDeferred.reject(false);
					}
					else {
						new xAlert(
						"Please verify you are connected to the internet and retry",
						function(button){
							if(button == 1) {
								preload();
							}
							else {
								preloadDeferred.reject(false);
							}
						},
						"Location Services",
						"Retry,Cancel"
						);
					}
                });
                return preloadDeferred.promise;
            }
            preload().then(function(){
                navigator.geolocation.getCurrentPosition(
                function (position) {
                    var geocoder = new google.maps.Geocoder();
        
                    var lat = position.coords.latitude;
                    var lng = position.coords.longitude;
                    var latlng = new google.maps.LatLng(lat, lng);
                    
                    geocoder.geocode({'latLng': latlng}, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            var address = results[0].address_components;
                            var newzip = address[address.length - 1].long_name;
                            // match five digits
                            //
                            var matches = newzip.match(/\b\d{5}\b/g);
                            if (!(matches && matches.length >= 1)) {
                            	self.error();
                                deferred.resolve();
                            }
                            else {
                                console.log("*Geolocated to zipcode: " + newzip);
                                self.complete();
                                deferred.resolve(newzip);
                            }
                        }
                        else {
                        	self.error();
                            deferred.resolve();
                        }
                    });
                },
                function(err) {
                    self.error();
        			deferred.resolve();
                });
                
            }, function(err){
            	self.busy = false;
        		deferred.resolve(false);
            },
            {timeout : 4000}
            );
            return deferred.promise;
        }
    };
    return Location;
});

myApp.factory('Categories', function() {
    var Categories =  [
        { id : '6745', name : 'Test Spin'},
        { id : '13', name : 'Accountants'},
        { id : '244', name : 'Appliances Repair'},
        { id : '6746', name : 'Auto Glass Repair'},
        { id : '479', name : 'Auto Repair'},
        { id : '6747', name : 'Bail Bonds'},
        { id : '6748', name : 'Bus Rental'},
        { id : '6749', name : 'Car Wash'},
        { id : '1075', name : 'Carpet Cleaners'},
        { id : '4629', name : 'Chiropractors'},
        { id : '1543', name : 'Computer Repair'},
        { id : '1886', name : 'Dentists'},
        { id : '6750', name : 'Electricians'},
        { id : '2512', name : 'Florists'},
        { id : '6752', name : 'Furniture Upholstery'},
        { id : '6753', name : 'Garage Door'},
        { id : '6754', name : 'Garbage Removal'},
        { id : '2886', name : 'Gyms & Fitness'},
        { id : '6771', name : 'Handyman'},
        { id : '2999', name : 'Heating and Cooling'},
        { id : '3515', name : 'Landscapers'},
        { id : '364', name : 'Lawyers - Bankruptcy'},
        { id : '360', name : 'Lawyers - Family'},
        { id : '6755', name : 'Lawyers - Traffic'},
        { id : '6756', name : 'Limo Rental'},
        { id : '3674', name : 'Locksmiths'},
        { id : '3735', name : 'Maid Services'},
        { id : '3810', name : 'Massage Therapy'},
        { id : '6757', name : 'Moving & Storage'},
        { id : '6758', name : 'Notaries'},
        { id : '4338', name : 'Painters'},
        { id : '6759', name : 'Party Planners'},
        { id : '4391', name : 'Party Rental'},
        { id : '4431', name : 'Personal Trainers'},
        { id : '6760', name : 'Pest Control'},
        { id : '4509', name : 'Physical Therapy'},
        { id : '4764', name : 'Plumbers'},
        { id : '4990', name : 'Real Estate'},
        { id : '6762', name : 'Rent Office Furniture'},
        { id : '5223', name : 'Roofers'},
        { id : '5609', name : 'Snow Removal'},
        { id : '6764', name : 'Tailors'},
        { id : '6765', name : 'Tax Preparation'},
        { id : '5947', name : 'Taxicabs'},
        { id : '6766', name : 'Towing'},
        { id : '6770', name : 'Tree Removal'},
        { id : '6767', name : 'Tutors'},
        { id : '6008', name : 'TV Repair'},
        { id : '6768', name : 'Veterinarians'},
        { id : '6769', name : 'Window Replacement'}
    ];
    return Categories;
});