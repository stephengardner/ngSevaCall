
myApp.factory('Test', ['RequestSubmittor', '$q', 'Times', 'User', 'Request', 'SCAPI', 'Recording', '$state', '$timeout',
	'AlertSwitch',
	function(RequestSubmittor, $q, Times, User, Request, SCAPI, Recording, $state, $timeout, AlertSwitch) {
	var Test = function() { };
    
    Test.prototype = {
    	requestStatusOverrides : {
        	one : '{"status":"success","data":[{"requestStatusID":"1876989","requestStatus":"ONE Thomas Plumbing Co Called ","companyID":"495861","requestStatusShort":"Calling"},{"requestStatusID":"1876990","requestStatus":"O\u0027Neill Plumbing Called ","companyID":"495866","requestStatusShort":"Calling"},{"requestStatusID":"1876991","requestStatus":"Geeks On-site Called ","companyID":"11930881","requestStatusShort":"Calling"},{"requestStatusID":"1876992","requestStatus":"Thomas Plumbing Co -... Called ","companyID":"12013570","requestStatusShort":"Calling"},{"requestStatusID":"1876993","requestStatus":"Thomas Plumbing Co Answered ","companyID":"495861","requestStatusShort":"Answered"},{"requestStatusID":"1876994","requestStatus":"Thomas Plumbing Co -... Answered ","companyID":"12013570","requestStatusShort":"Answered"},{"requestStatusID":"1876995","requestStatus":"O\u0027Neill Plumbing Answered ","companyID":"495866","requestStatusShort":"Answered"},{"requestStatusID":"1876996","requestStatus":"Geeks On-site Answered ","companyID":"11930881","requestStatusShort":"Answered"},{"requestStatusID":"1876997","requestStatus":"O\u0027Neill Plumbing Call Completed ","companyID":"495866","requestStatusShort":"Hung Up"},{"requestStatusID":"1876998","requestStatus":"Thomas Plumbing Co -... Call Completed ","companyID":"12013570","requestStatusShort":"Hung Up"},{"requestStatusID":"1876999","requestStatus":"Thomas Plumbing Co Call Completed ","companyID":"495861","requestStatusShort":"Hung Up"},{"requestStatusID":"1877000","requestStatus":"Geeks On-site Call Completed ","companyID":"11930881","requestStatusShort":"Hung Up"},{"requestStatusID":"1877001","requestStatus":"Request Completed","companyID":"0","requestStatusShort":"Completed"}]}',
            two : '{"status":"success","data":[{"requestStatusID":"1876989","requestStatus":"Thomas Plumbing Co Called ","companyID":"495861","requestStatusShort":"T2 Calling"},{"requestStatusID":"1876990","requestStatus":"TESTING TWO O\u0027Neill Plumbing Called ","companyID":"495866","requestStatusShort":"T2 Calling"},{"requestStatusID":"1876991","requestStatus":"TESTING TWO Geeks On-site Called ","companyID":"11930881","requestStatusShort":"T2 Calling"},{"requestStatusID":"1876992","requestStatus":"TESTING TWO Thomas Plumbing Co -... Called ","companyID":"12013570","requestStatusShort":"T2 Calling"},{"requestStatusID":"1876993","requestStatus":"Thomas Plumbing Co Answered ","companyID":"495861","requestStatusShort":"T2 Answered"},{"requestStatusID":"1876994","requestStatus":"Thomas Plumbing Co -... Answered ","companyID":"12013570","requestStatusShort":"T2 Answered"},{"requestStatusID":"1876995","requestStatus":"TESTING TWO O\u0027Neill Plumbing Answered ","companyID":"495866","requestStatusShort":"T2 Answered"},{"requestStatusID":"1876996","requestStatus":"TESTING TWO Geeks On-site Answered ","companyID":"11930881","requestStatusShort":"T2 Answered"},{"requestStatusID":"1876997","requestStatus":"TESTING TWO O\u0027Neill Plumbing Call Completed ","companyID":"495866","requestStatusShort":"T2 Hung Up"},{"requestStatusID":"1876998","requestStatus":"TESTING TWO Thomas Plumbing Co -... Call Completed ","companyID":"12013570","requestStatusShort":"T2 Hung Up"},{"requestStatusID":"1876999","requestStatus":"TESTING TWO Thomas Plumbing Co Call Completed ","companyID":"495861","requestStatusShort":"T2 Hung Up"},{"requestStatusID":"1877000","requestStatus":"Geeks On-site Call Completed ","companyID":"11930881","requestStatusShort":"T2 Hung Up"},{"requestStatusID":"1877001","requestStatus":"Request Completed","companyID":"0","requestStatusShort":"Completed"}]}'
        },
        test1 : function() {
            //Request.setDescription("test 1 2 3 4 5 6 7");
            Recording.saved = true;
            User.setZipcode("20861");
            Request.setCategory("Test Spin");
            Times.timesActive = ["4-1", "2-3"];
            Times.buttons = { now : true };
            var url = SCAPI.generateURL("searchAction3");
            console.log("*SearchAction3 Test URL: " + url);
        },
        test2 : function(){
			var gotFS = function(fileSystem){
				//alert("fileSystem root path: " + fileSystem.root.toURL());
				fileSystem.root.getFile("sc_recording3.wav", {create: true, exclusive: false}, function(fileEntry){
						//alert("fileEntry path: " + fileEntry.toURL());
						console.log("*****SOURCE: " + fileEntry.fullPath);
						Recording.src = fileEntry.toURL();
						Recording.mediaRec = new Media(Recording.src, function(){ alert("OK"); }, function(err){ 
						console.log("MediaError callback code: " + err.code);
						console.log("MediaError callback message: " + err.message);alert("NOT OK"); }, function(){ });
						
						Recording.mediaRec.startRecord();
							alert("RECORDING");
						//mediaRec.stopRecord();
						
						window.setTimeout(function(){
							Recording.mediaRec.stopRecord();
						}, 1000);
						window.setTimeout(function(){
							alert("PLAYING");
							Recording.mediaRec.release();
							var mediaRec = new Media(Recording.src);
							mediaRec.play();
						}, 1500);
						
					}, function(){
						alert("fail");
					}
				);
			};
            window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, gotFS, function fail(){});
			
        },
		
		setTestParams : function() {
        	skipAPICalls = true;
			User.setZipcode("20010");
			Request.setCategory("Test Spin");
			Times.timesActive = ["4-1", "2-3"];
			Times.buttons = { now : true };
			User.setName("Augie Testing Via Test Service");
			User.setEmail("Augie@a.co");
			User.setPhone("3017047437");
		},
		
		test3 : function() {
        	var self = this;
			this.setTestParams();
            AlertSwitch.turnOff();
			Request.setID(testRequestID);
            Request.setRequestStatusOverride(self.requestStatusOverrides.two);
            RequestSubmittor.step1().then(
            	RequestSubmittor.step2().then(function(){
                $timeout(function() {
            		$state.go("step1");
                    $timeout(function(){
            			Request.setRequestStatusOverride(self.requestStatusOverrides.one);
                    	RequestSubmittor.step1().then(RequestSubmittor.step2());
                    }, 1000);
                }, 1000);
            }));
        }
     
        
    };
    return new Test();
}]);