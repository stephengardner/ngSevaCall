myApp.directive('tlOnFinishRender', function ($timeout) {
	return {
		restrict: 'A',
		link: function (scope, element, attr) {
			if (scope.$last){
				if(!scope.tlOnFinishRender)
					scope.tlOnFinishRender = true;
				scope.$emit('ngRepeatFinished');
			}
			scope.$watch(attr.xsMultiselect, function() {
				if(!scope.tlOnFinishRender) {
					scope.tlOnFinishRender = true;
					scope.$evalAsync(function() {
						scope.$emit('ngRepeatFinished');
					});
				}
			});

		}
	}
});