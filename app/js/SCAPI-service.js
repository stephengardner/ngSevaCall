myApp.factory('SCAPI', function(User, $http, $q){
    var SCAPI = {
        init : function(Request) {
            this.Request = Request;
        },
        busy : false,
        urls : {
            step1 : "/api/mobile/v2/searchAction1.php",
            getCompaniesList : "/api/mobile/v2/getCompaniesList.php",
            seachAction3 : "/api/mobile/v2/searchAction3.php",
            getRequestStatus : "/api/mobile/v4/request/status",
            getYelpRating :'/api/mobile/v2/getRating.php?source=yelp',// + source + '&companyName=' + encodeURIComponent(company.name) + '&companyZipcode=' + encodeURIComponent(company.zip) + '&companyPhone=' + encodeURIComponent(company.phone);
            getCitysearchRating :'/api/mobile/v2/getRating.php?source=citysearch',
            getGoogleRating :'/api/mobile/v2/getRating.php?source=google',
            getRating : '/api/mobile/v2/getRating.php'
        },
        data : { key : "tmp", boxType : "get", demoNumber : "3018764913" },
        step1 : function(){
            console.log("step1");
            var self = this;
            if (self.busy) return; // return if the http status is busy
            self.busy = true; // set the http status to busy
            self.data.category_short = self.Request.category;
            self.data.search_location = User.zipcode;
            //var url = self.urls.step1 + "?" + $.param(self.data); // create the url to ping
            var url = self.postifyUrl(self.urls.step1);
            console.log(url);
            console.log("step1 url: " + url);
            var deferred = $q.defer(); // use Angular's $q API to set this function to return a promise, which will be fulfilled when $q is "reolve()d"
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
                        numRatingsYelp: "",
                        ratingCitysearch: 0,
                        numRatingsCitysearch: "",
                        ratingGoogle: 0,
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
            $http({
                url : url,
                method : "GET",
                headers : {'Content-Type': 'application/json'}
            }).success(function(d) {
                deferred.resolve(d);
            }).error(function(d){
                deferred.resolve(d);
            });
            return deferred.promise;
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
                gotRating();
            });
            getRating("citysearch").then(function(d){
                var data = d.split("|");
                company.ratingCitysearch = data[0] > 0 ? data[0] : 0;
                gotRating();
            });
            getRating("google").then(function(d){
                var data = d.split("|");
                company.ratingGoogle = data[0] > 0 ? data[0] : 0;
                gotRating();
            });
            return deferred.promise;
        }
    };
    return SCAPI;
});