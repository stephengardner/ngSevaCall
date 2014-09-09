myApp.controller('summaryController', ['TwitterService', 'Track', 'Request', 'SCAPI', '$scope', function(TwitterService, Track, Request, SCAPI, $scope){
	TwitterService.init();
	Request.setID(112669);
	$scope.request = Request;
	$scope.acceptanceRate = Request.numCompaniesCalled ?  Math.round(((parseFloat( Request.numCompaniesAccepted  /  Request.numCompaniesCalled * 100)))) + "%" : "0%";
	SCAPI.timeSaved().then(function(d) {
		$scope.timeSaved = d.timeSaved;
	});
	$scope.twitterMessage = encodeURIComponent("talklocal found me help in minutes! talklocal.com #savetime #awesome @talklocal");
	$scope.twttrURL = "https://twitter.com/intent/tweet?url=http://www.talklocal.com&text=" + encodeURIComponent("talklocal found me help in minutes! talklocal.com #savetime #awesome @talklocal");

	$scope.twitterShare = function() {
		Track.event(2, 'twitter_share_button_pressed', true);
	}

	$scope.facebookShare = function() {
		Track.event(2, 'facebook_share_button_pressed', true);
		var url = "http://facebook.com/dialog/feed";
		url += "?app_id=696501850437286";
		url += "&link=http://talklocal.com";
		url += "&name= talklocal - Tell us what and when, we'll find the professionals!";
		url += "&description=talklocal works to find local businesses that can help you with your service need instantly, like a free personal concierge service. Within minutes you will be connected to providers that can service your specific problem, on your schedule, at your location.";
		url += "&redirect_uri=http://talklocal.com";
		console.log("popping up fb url: " + url);
		window.open("http://www.facebook.com/dialog/feed?app_id=696501850437286&link=http://talklocal.com&name="
			+ encodeURIComponent("talklocal - Tell us what and when, we'll find the professionals!") + "&redirect_uri=http://talklocal.com", '_system');
		return false;
	}
}])