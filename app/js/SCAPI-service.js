myApp.factory('SCAPI', function($timeout, User, $http, $q){
    var SCAPI = {
        init : function(Request) {
            this.Request = Request;
        },
        busy : false,
        urls : {
            step1 : api_root + "api/mobile/v2/searchAction1.php",
            getCompaniesList : api_root + "api/mobile/v2/getCompaniesList.php",
            seachAction3 : api_root + "api/mobile/v2/searchAction3.php",
            getRequestStatus : api_root + "api/mobile/v4/request/status",
            getYelpRating : api_root + 'api/mobile/v2/getRating.php?source=yelp',// + source + '&companyName=' + encodeURIComponent(company.name) + '&companyZipcode=' + encodeURIComponent(company.zip) + '&companyPhone=' + encodeURIComponent(company.phone);
            getCitysearchRating : api_root + 'api/mobile/v2/getRating.php?source=citysearch',
            getGoogleRating : api_root + 'api/mobile/v2/getRating.php?source=google',
            getRating : api_root + 'api/mobile/v2/getRating.php',
            timeSaved : api_root + 'api/mobile/v4/request/time_saved'
        },
        data : { key : "tmp", boxType : "get", demoNumber : "3018764913" },
        step1 : function(){
            var self = this;
            console.log("step1");
            var deferred = $q.defer(); // use Angular's $q API to set this function to return a promise, which will be fulfilled when $q is "reolve()d"
            if (self.busy) {
                deferred.resolve(false);
                return; // return if the http status is busy
            }
            self.busy = true; // set the http status to busy
            self.data.category_short = self.Request.category;
            self.data.search_location = User.zipcode;
            //var url = self.urls.step1 + "?" + $.param(self.data); // create the url to ping
            var url = self.postifyUrl(self.urls.step1);
            console.log(url);
            console.log("step1 url: " + url);
            self.data.pagesInclusive = 0; // nextPage() will never want all the inclusive quotes, only the next page.
            $http({
                url : url,
                method : "GET",
                headers : {'Content-Type': 'application/json'}
            }).
                success(function(d) {
                    self.busy = false; // reset http status, allow future pings
                    // transform the step1 result
                    var results = d.split("|");
                    self.Request.setID(results[1]);
                    deferred.resolve(d); // resolve the $q promise
                }).
                error(function(d){
                    alert("err"); // testing, simply return an alert for now
                    deferred.resolve(d); // resolve the $q promise
                });
            return deferred.promise; // once the http callback has been fulfilled, this function returns the satisfied promise
        },
        getCompaniesList : function() {
            var self = this;
            self.data.requestID = self.Request.id;
            //var url =  self.urls.getCompaniesList + "?" + $.param(self.data); // create the url to ping
            var url = self.postifyUrl(self.urls.getCompaniesList);
            var deferred = $q.defer(); // use Angular's $q API to set this function to return a promise, which will be fulfilled when $q is "reolve()d"
            $http({
                url : url,
                method : "GET",
                headers : {'Content-Type': 'application/json'}
            }).success(function(d) {
                console.log("success:", d);
                var companyNodes = d.split("|");
                console.log("Retrieved " + ((companyNodes.length) - 1) + " companies in the CompanyList:");
                for (var i = 0; i < companyNodes.length - 1; i++) {
                    var companyAttrs = companyNodes[i].split("^~^");
                    self.Request.companies[companyAttrs[0]] = new Object({
                        name: companyAttrs[1],
                        id: companyAttrs[0],
                        lat: companyAttrs[2],
                        lon: companyAttrs[3],
                        addr: companyAttrs[4],
                        city: companyAttrs[5].capitalize(),
                        state: companyAttrs[6],
                        zip: companyAttrs[7],
                        phone: companyAttrs[8],
                        markerNumber: (i + 1),
                        status: "none",
                        marker: new Object(),
                        infoBox: new Object(),
                        infoBoxEvent: function () {
                        },
                        ratingYelp: 0,
                        isYelpLoaded : 0,
                        numRatingsYelp: "",
                        ratingCitysearch: 0,
                        isCitysearchLoaded : false,
                        numRatingsCitysearch: "",
                        ratingGoogle: 0,
                        isGoogleLoaded: 0,
                        numRatingsGoogle: "",
                        reviewsLoaded: 0,
                        reviewsHTML: "",
                        accepted : 0,
                        visible : 0,
                        acceptedOrder : 0
                    });
                }
                console.log("Companies are:",self.Request.companies);
                deferred.resolve(d); // resolve the $q promise
            }).error(function(d) {
                console.log("error:", d);
                deferred.resolve(d); // resolve the $q promise
            });
            return deferred.promise; // once the http callback has been fulfilled, this function returns the satisfied promise
        },

        postifyUrl : function(url){
            var self = this;
            self.data.description = self.Request.description;
            self.data.requestID = self.Request.id;
            var newURL = url + "?" + $.param(self.data);
            return newURL;
        },

        postifyUser : function(){
            var str = "";
            var firstThree = User.phone.substring(0, 3);
            var secondThree = User.phone.substring(3, 6);
            var lastFour = User.phone.substring(6, 10);
            var dataToPostify = {
                name : User.name,
                email : User.email,
                phone1 : firstThree,
                phone2 : secondThree,
                phone3 : lastFour
            }
            return $.param(dataToPostify);
        },

        searchAction3 : function(){
            var self = this;
            self.data.requestID = self.Request.id;
            var deferred = $q.defer(); // use Angular's $q API to set this function to return a promise, which will be fulfilled when $q is "reolve()d"
            var url =  self.postifyUrl(self.urls.seachAction3) + self.postifyUser();
            console.log("SeachAction3 URL : " + url);
            if(testing) {
                $timeout(function(){
                    deferred.resolve(true);
                }, 2000);
            }
            else {
                $http({
                    url : url,
                    method : "GET",
                    headers : {'Content-Type': 'application/json'}
                }).success(function(d) {
                    deferred.resolve(d);
                }).error(function(d){
                    deferred.resolve(d);
                });
            }
            return deferred.promise;
        },
        timeSaved : function() {
            var self = this;
            self.data.requestID = self.Request.id;
            //var url =  self.urls.getCompaniesList + "?" + $.param(self.data); // create the url to ping
            var url = self.postifyUrl(self.urls.timeSaved);
            var deferred = $q.defer(); // use Angular's $q API to set this function to return a promise, which will be fulfilled when $q is "reolve()d"
            $http({
                url : url,
                method : "GET",
                headers : {'Content-Type': 'application/json'}
            }).success(function(d) {
                console.log("success:", d);
                //self.setRequestStatus(d.data);
                deferred.resolve(d.data); // resolve the $q promise
            }).error(function(d) {
                console.log("error:", d);
                deferred.resolve(d); // resolve the $q promise
            });
            return deferred.promise; // once the http callback has been fulfilled, this function returns the satisfied promise
        },
        setRequestStatus : function(d){
            this.Request.setStatuses(d);
        },

        getRequestStatus : function(){
            var self = this;
            self.data.requestID = self.Request.id;
            //var url =  self.urls.getCompaniesList + "?" + $.param(self.data); // create the url to ping
            var url = self.postifyUrl(self.urls.getRequestStatus);
            var deferred = $q.defer(); // use Angular's $q API to set this function to return a promise, which will be fulfilled when $q is "reolve()d"
            $http({
                url : url,
                method : "GET",
                headers : {'Content-Type': 'application/json'}
            }).success(function(d) {
                console.log("success:", d);
                //self.setRequestStatus(d.data);
                deferred.resolve(d.data); // resolve the $q promise
            }).error(function(d) {
                console.log("error:", d);
                deferred.resolve(d); // resolve the $q promise
            });
            return deferred.promise; // once the http callback has been fulfilled, this function returns the satisfied promise
        },

        getRatings : function(company) {
            var self = this;
            var deferred = $q.defer();

            function parseCompany(){
                var params = {
                    companyName : company.name,
                    companyZipcode : company.zip,
                    companyPhone : company.phone
                };
                console.log("returning", $.param(params));
                return $.param(params);
            }
            function getRating(source){
                var deferred = $q.defer();
                var url = self.urls.getRating + "?source=" + source + "&" +  parseCompany();
                console.log("url is: " + url);
                $http({
                    url : url,
                    method : "GET",
                    headers : {'Content-Type': 'application/json'}
                }).success(function(d){
                    deferred.resolve(d);
                    var ratingSplit = d.split("|");
                    var rating = ratingSplit[0];
                    var numRatings = ratingSplit[1];
                    /*
                    if(source == "google") {
                        company.ratingGoogle = rating;
                        company.numRatingsGoogle = numRatings;
                        company.googleStarOffset = -4.25 + (rating * 12.5);
                    }
                    if(source == "citysearch") {
                        company.ratingCitysearch = rating;
                        company.numRatingsCitysearch = numRatings;
                        company.citysearchStarOffset = -4.25 + (rating * 12.5);
                    }
                    if(source == "yelp") {
                        company.ratingYelp = rating;
                        company.numRatingsYelp = numRatings;
                        company.yelpStarOffset = -4.25 + (rating * 12.5);
                    }
                    */
                    console.log("success getting " + source + "ratings: " + d);
                }).error(function(d){
                    console.log("error: " + d);
                });
                return deferred.promise;
            }
            var numRatings = 0;
            function gotRating(){
                numRatings++;
                if(numRatings == 3)
                    deferred.resolve(true);
            }
            getRating("yelp").then(function(d){
                var data = d.split("|");
                company.ratingYelp = data[0] > 0 ? data[0] : 0;
                company.numRatingsYelp = data[1];
                company.yelpStarOffset = -4.66 + (data[0] * 12.66);
                company.isYelpLoaded = 1;
                gotRating();
            });
            getRating("citysearch").then(function(d){
                var data = d.split("|");
                var companyRating = d[0];
               // companyRating /= 2;
                companyRating = Math.floor(companyRating) + ( Math.round((companyRating - Math.floor(companyRating))) ? 0.5 : 0.0 );
                company.ratingCitysearch = companyRating;
                var starOffset = -4.66 + (companyRating * 12.66);
                company.citysearchStarOffset = starOffset;
                company.numRatingsCitysearch = data[1];
                company.isCitysearchLoaded = 1;
                gotRating();
            });
            getRating("google").then(function(d){
                var data = d.split("|");
                company.ratingGoogle = data[0] > 0 ? data[0] : 0;
                company.googleStarOffset = -4.66 + (data[0] * 12.66);
                company.numRatingsGoogle = data[1];
                company.isGoogleLoaded = 1;
                gotRating();
            });
            return deferred.promise;
        }
    };
    return SCAPI;
});