myApp.directive('tlSelect', function(){
	return {
		restrict : 'AE',
		templateUrl : 'views/partials/tl-select.partial.html',
		link : function(){
			setTimeout(function(){
				document.getElementById("disabled").disabled = 'yes'
			}, 1);
		}
	};
});