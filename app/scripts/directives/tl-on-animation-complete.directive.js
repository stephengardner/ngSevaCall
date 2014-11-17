myApp.directive("tlOnAnimationComplete", [function(){
	return {
		restrict : "AE",
		link : function(scope, element, attrs) {
			scope.$watch(function() {return $(".slide").attr("class") }, function(newValue){
				console.log("classchanging...");
				//alert(newValue);
				if(newValue.indexOf("ng-enter") != -1) {
					scope.animating = true;
				}
				if(newValue.indexOf("ng-enter") == -1 && scope.animating) {
					scope.animating = false;
					scope.$broadcast("animationComplete");
				}
			});
		}
	}
}])