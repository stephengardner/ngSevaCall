var appTutorial = angular.module('appTutorial', ['templates/tutorial.html',
		'templates/step1A.html', 'templates/step1B.html', 'templates/step1C.html', 'templates/step2A.html'
		, 'templates/step2B.html', 'templates/step2C.html', 'templates/stepTimetable.html'
		, 'templates/step0.html', 'templates/stepSettings.html', 'templates/stepRecording.html'])
	.run(['$rootScope', '$appTutorial', '$timeout', function($rootScope, $appTutorial, $timeout){
		window.offset = function(elm) {
			try {return elm.offset();} catch(e) {}
			var rawDom = elm[0];
			var _x = 0;
			var _y = 0;
			var body = document.documentElement || document.body;
			var scrollX = window.pageXOffset || body.scrollLeft;
			var scrollY = window.pageYOffset || body.scrollTop;
			_x = rawDom.getBoundingClientRect().left + scrollX;
			_y = rawDom.getBoundingClientRect().top + scrollY;
			return { left: _x, top:_y };
		}
		$("body").append('<div app-tutorial id="app-tutorial" ng-class="{\'active\' : $appTutorial.state != \'closed\' && $appTutorial.state != \'hidden\'}"></div>');

		$rootScope.$on("animationEnd", function(event, state){
			if(!$appTutorial.initialized) {
				$appTutorial.initialized = true;
				$timeout(function(){
					$appTutorial.update(state);
				}, 1000);
			}
			else {
				$appTutorial.update(state);
			}
			$rootScope.$apply();
		});
	}]);

appTutorial.directive('appTutorial', ['$appTutorial', function($appTutorial){
	return {
		restrict : 'AE',
		controller : 'appTutorialController',
		templateUrl : 'templates/tutorial.html'
	};
}]);
appTutorial.directive('tutorialStep0', [function(){
	return {
		restrict : 'AE',
		templateUrl : 'templates/step0.html',
		controller : 'tutorialStep0Controller'
	};
}]);
appTutorial.directive('tutorialStep1a', [function(){
	return {
		restrict : 'AE',
		templateUrl : 'templates/step1A.html',
		controller : 'tutorialStep1AController'
	};
}]);
appTutorial.directive('tutorialStep1b', [function(){
	return {
		restrict : 'AE',
		templateUrl : 'templates/step1B.html',
		controller : 'tutorialStep1BController'
	};
}]);
appTutorial.directive('tutorialStep1c', [function(){
	return {
		restrict : 'AE',
		templateUrl : 'templates/step1C.html',
		controller : 'tutorialStep1CController'
	};
}]);
appTutorial.directive('tutorialStep2a', [function(){
	return {
		restrict : 'AE',
		templateUrl : 'templates/step2A.html',
		controller : 'tutorialStep2AController'
	};
}]);
appTutorial.directive('tutorialStep2b', [function(){
	return {
		restrict : 'AE',
		templateUrl : 'templates/step2B.html',
		controller : 'tutorialStep2BController'
	};
}]);
appTutorial.directive('tutorialStep2c', [function(){
	return {
		restrict : 'AE',
		templateUrl : 'templates/step2C.html',
		controller : 'tutorialStep2CController'
	};
}]);

appTutorial.directive('tutorialStepTimetable', [function(){
	return {
		restrict : 'AE',
		templateUrl : 'templates/stepTimetable.html',
		controller : 'tutorialStepTimetableController'
	};
}]);
appTutorial.directive('tutorialStepSettings', [function(){
	return {
		restrict : 'AE',
		templateUrl : 'templates/stepSettings.html',
		controller : 'tutorialStepSettingsController'
	};
}]);
appTutorial.directive('tutorialStepRecording', [function(){
	return {
		restrict : 'AE',
		templateUrl : 'templates/stepRecording.html',
		controller : 'tutorialStepRecordingController'
	};
}]);

appTutorial.factory('$appTutorial', ['Storage', function(Storage){
	var $appTutorial = {
		initialized : false,
		state : 'hidden',
		accepted : false,
		readyForNext : false,
		stages : {
			reset : function() {
				$appTutorial.stages.step1 = "A";
				$appTutorial.stages.step2 = "A";
			},
			step1 : "A",
			step2 : "A",
			timetable : "A",
			settings : "A",
			recording : "A"
		},

		update : function(state) {
			if(Storage.tutorialDismissed)
				return false;
			if(state.current.name == 'step1') {
				if($appTutorial.accepted){
					$appTutorial.activateStep(1);
				}
				else{
					$appTutorial.activateStep(0);
				}
			}
			if(state.current.name == 'step2') {
				$appTutorial.activateStep(2);
			}
			if(state.current.name == 'timetable') {
				$appTutorial.activateStep('timetable');
			}
			if(state.current.name == 'settings' || state.current.name == "step2a") {
				$appTutorial.activateStep('settings');
			}
			if(state.current.name == 'recording') {
				$appTutorial.activateStep('recording');
			}
		},

		empty : function() {
			if(this.state != 'hidden' && this.state != 'closed' && this.accepted){
				this.state = 'transitioning';
				this.readyForNext = false;
			}
		},

		activateStep : function(step) {
			this.header = false;
			if(this.state == "closed")
				return false;
			if(step == 0) {
				this.step0();
			}
			if(step == 1) {
				this.accepted = true;
				if(this.stages.step1 == "A")
					this.step1A();
				if(this.stages.step1 == "B")
					this.step1B();
				if(this.stages.step1 == "C")
					this.step1C();
			}
			if(step == 2) {
				if(this.stages.step2 == "A")
					this.step2A();
				if(this.stages.step2 == "B")
					this.step2B();
				if(this.stages.step2 == "C")
					this.step2C();
			}
			if(step == 'timetable') {
				if(this.stages.timetable == "A") {
					this.stepTimetableA();
				}
				else if(this.stages.timetable == "B") {
					this.stepTimetableB();
				}
				this.header = true;
			}
			if(step == 'settings') {
				if(this.stages.settings == "A") {
					this.stepSettingsA();
				}
				else if(this.stages.settings == "B") {
					this.stepSettingsB();
				}
				this.header = true;
			}
			if(step == 'recording') {
				if(this.stages.recording == "A") {
					this.stepRecordingA();
				}
				else if(this.stages.recording == "B") {
					this.stepRecordingB();
				}
				this.header = true;
			}
		},

		step0 : function() {
			this.state = 'step0';
		},

		isActive : function() {
			if(this.state == 'closed' || this.state == 'hidden') {
				return false;
			}
			return true;
		},

		prepare : function() {
			$(".highlight").removeClass("highlight");
			$(".GPUAccel").addClass("pauseGPUAccel");
		},

		release : function() {
			$(".pauseGPUAccel").removeClass("pauseGPUAccel");
		},

		step1A : function() {
			if(this.isActive()) {
				this.prepare();
				$(".what").addClass("highlight highlight-shadow");
				$(".category-title").addClass("highlight");
				this.state = 'step1A';
				this.stages.reset();
				this.stages.step1 = "A";
			}
		},
		step1B : function() {
			if(this.isActive()) {
				this.prepare();
				$(".where-text-innerwrap .shadow, #where-button").addClass("highlight-shadow");
				$(".where, .where-title").addClass("highlight");
				this.state = 'step1B';
				this.stages.step1 = "B";
			}
		},
		step1C : function() {
			if(this.isActive()) {
				this.prepare();
				$(".what, .where, form h1").addClass("highlight");
				$(".action-button").addClass("highlight highlight-shadow");
				this.state = 'step1C';
				this.stages.step1 = "C";
				this.readyForNext = true;
			}
		},
		step2A : function() {
			if(this.isActive()) {
				this.prepare();
				$(".description textarea, #description-button").addClass("highlight highlight-shadow");
				$(".description-title").addClass("highlight");
				this.state = 'step2A';
				this.stages.step2 = "A";
			}
		},
		step2B : function() {
			if(this.isActive()) {
				this.prepare();
				$(".description textarea, #description-button").removeClass("highlight highlight-shadow");
				$(".time-button").addClass("highlight highlight-shadow");
				$(".time-title").addClass("highlight");
				this.state = 'step2B';
				this.stages.step2 = "B";
			}
		},
		step2C : function() {
			if(this.isActive()) {
				this.prepare();
				$(".description textarea, #description-button").addClass("highlight highlight-shadow");
				$("h1").addClass("highlight");
				$(".time-button").addClass("highlight highlight-shadow");
				$(".btn.action-button").addClass("highlight highlight-shadow");
				this.state = 'step2C';
				this.stages.step2 = "C";
				this.readyForNext = true;
			}
		},
		stepTimetableA : function() {
			if(this.isActive()) {
				this.prepare();
				this.state = 'stepTimetableA';
			}
		},
		stepTimetableB : function() {
			if(this.isActive()) {
				this.prepare();
				$(".timetable").addClass("highlight");
				$(".aside").addClass("highlight");
				$(".timetable .head").addClass("highlight");
				$(".btn.action-button").addClass("highlight highlight-shadow");
				this.state = 'stepTimetableB';
			}
		},
		stepSettingsA : function() {
			if(this.isActive()) {
				this.prepare();
				this.stages.settings = "A";
				this.state = 'stepSettingsA';
			}
		},
		stepSettingsB : function() {
			if(this.isActive()) {
				this.prepare();
				$("h1, .setting-wrapper i").addClass("highlight");
				$(".btn.action-button,  input").addClass("highlight highlight-shadow");
				this.stages.settings = "B";
				this.state = 'stepSettingsB';
			}
		},
		stepRecordingA : function() {
			if(this.isActive()) {
				this.prepare();
				this.stages.recording = "A";
				this.state = 'stepRecordingA';
			}
		},
		stepRecordingB : function() {
			if(this.isActive()) {
				this.prepare();
				$(".ui-view-container").addClass("highlight highlight-shadow");
				this.stages.recording = "B";
				this.state = 'stepRecordingB';
			}
		},
		removeShadow : function() {
			$(".highlight-shadow").removeClass("highlight-shadow");
		},
		hide : function(){
			$("*").removeClass("highlight highlight-shadow");
			$(".GPUAccel").removeClass("pauseGPUAccel");
			this.removeShadow();
			this.state = "hidden";
		},
		close : function(){
			$("*").removeClass("highlight highlight-shadow");
			$(".GPUAccel").removeClass("pauseGPUAccel");
			this.removeShadow();
			this.state = "closed";
		},
		dontShowAgain : function() {
			Storage.tutorialDismissed = true;
			Storage.set();
			this.hide();
		}
	};
	return $appTutorial;
}]);

appTutorial.controller('appTutorialController', ['Storage', 'appStateTracker', '$rootScope', 'Request', 'User', '$scope', '$appTutorial', 'Recording',
	function(Storage, appStateTracker, $rootScope, Request, User, $scope, $appTutorial, Recording) {
	$scope.appStateTracker = appStateTracker;
	$scope.$appTutorial = $appTutorial;
	$scope.User = User;
	$scope.Request = Request;
	$scope.Recording = Recording;
	$scope.$on('$stateChangeStart', function(){
		//$appTutorial.empty();
		$(".pauseGPUAccel").removeClass("pauseGPUAccel");
	});
	// if the request is reset, make sure to reset each stage of the tutorial.
	$scope.$on('reset', function(){
		$appTutorial.stages.reset();
	});
	$scope.$on('submit', function(){
		$appTutorial.stages.reset();
		$appTutorial.hide();
	});
	$scope.$watch('User.zipcode', function(){
		if($appTutorial.state == "step1B" && /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(User.zipcode))
			$appTutorial.step1C();
	});
}]);

appTutorial.controller('tutorialStep0Controller', ['$scope', function($scope){
	$scope.position = {
		top : $(".what").offset().top + $(".what").height() + 20,
		left : $(".what").offset().left
	};
}]);

appTutorial.controller('tutorialStep1AController', ['$scope', function($scope){
	$scope.position = {
		top : $(".what").offset().top + $(".what").height() + 20,
		left : $(".what").offset().left
	};
}]);

appTutorial.controller('tutorialStep1BController', ['$scope', function($scope){
	$scope.position = {
		description : {
			top : $(".where").offset().top + $(".where").height() + 20,
			left : $(".where").offset().left
		},
		button : {
			top : $(".where").offset().top - 40, // 40 adjusts 20 for the blurb height and then 20 for the offset
			right : ($(window).width() - ($(".where").offset().left + $(".where").outerWidth()))
		}
	};
	console.log("position is: ", $scope.position);
}]);

appTutorial.controller('tutorialStep1CController', ['$scope', function($scope){
	$scope.position = {
		description : {
			top : $(".where").offset().top + $(".where").height() + 10,
			left : $(".ui-view-container").offset().left
		}
	};
}]);

appTutorial.controller('tutorialStep2AController', ['$scope', function($scope){
	$scope.position = {
		description : {
			top : $(".description").offset().top + $(".description").height() + 20,
			left : $(".ui-view-container").offset().left
		}
	};
}]);

appTutorial.controller('tutorialStep2BController', ['$scope', function($scope){
	$scope.position = {
		description : {
			top : $(".time-buttons").offset().top + $(".time-buttons").height() + 20,
			left : $(".ui-view-container").offset().left
		}
	};
}]);

appTutorial.controller('tutorialStep2CController', ['$scope', function($scope){
	$scope.position = {
		description : {
			top : $("#step2Next").offset().top + $("#step2Next").height() + 20,
			left : $(".ui-view-container").offset().left
		}
	};
}]);

appTutorial.controller('tutorialStepTimetableController', ['$scope', function($scope){
	$scope.position = {
		description : {
			top : $(".timetable").offset().top,
			left : $(".ui-view-container").offset().left
		}
	};
}]);

appTutorial.controller('tutorialStepSettingsController', ['$scope', function($scope){
	$scope.position = {
		description : {
			top : $("#step2a").offset().top,
			left : $(".ui-view-container").offset().left
		}
	};
}]);

appTutorial.controller('tutorialStepRecordingController', ['$scope', function($scope){
	$scope.position = {
		description : {
			top : $("#recording").offset().top,
			left : $(".ui-view-container").offset().left
		}
	};
}]);

angular.module("templates/tutorial.html", []).run(["$appTutorial", "$templateCache", function($appTutorial, $templateCache) {
	$templateCache.put("templates/tutorial.html",
		'<div ng-show="$appTutorial.state != \'hidden\' && $appTutorial.state != \'closed\'" class="app-tutorial-overlay">' +
		'</div>' +
		'<div ng-show="$appTutorial.state != \'hidden\' && $appTutorial.state != \'closed\'" class="app-tutorial" ng-if="$appTutorial.state != \'hidden\' && $appTutorial.state != \'closed\' ">' +
			'<div ng-if="$appTutorial.header" class="fixed-header">' +
				'<div id="nav" class="icon highlight" ng-class="{ forward : navigation.direction == \'forward\' }" ng-click="nav()" style="display: block;">' +
				'<img height="25px" width="35px" src="images/back.png" class="highlight">' +
				'</div>' +
			'</div>' +
			'<div ng-click="$appTutorial.close()" class="close">' +
			'<span>close</span>' +
			'<i class="fa fa-times"></i>' +
			'</div>' +
			'<div ng-if="$appTutorial.state == \'step0\'" tutorial-step0>' +
			'</div>' +
			'<div ng-if="$appTutorial.state == \'step1A\'" tutorial-step1A>' +
			'</div>' +
			'<div ng-if="$appTutorial.state == \'step1B\'" tutorial-step1B>' +
			'</div>' +
			'<div ng-if="$appTutorial.state == \'step1C\'" tutorial-step1C>' +
			'</div>' +
			'<div ng-if="$appTutorial.state == \'step2A\'" tutorial-step2A>' +
			'</div>' +
			'<div ng-if="$appTutorial.state == \'step2B\'" tutorial-step2B>' +
			'</div>' +
			'<div ng-if="$appTutorial.state == \'step2C\'" tutorial-step2C>' +
			'</div>' +
			'<div ng-if="$appTutorial.state == \'stepTimetableA\'" tutorial-step-timetable>' +
			'</div>' +
			'<div ng-if="$appTutorial.state == \'stepSettingsA\'" tutorial-step-settings>' +
			'</div>' +
			'<div ng-if="$appTutorial.state == \'stepRecordingA\'" tutorial-step-recording>' +
			'</div>' +
		'</div>'
	);
}]);

angular.module("templates/step0.html", []).run(["$templateCache", function($templateCache) {
	$templateCache.put("templates/step0.html",
		'<div class="tutorial-step0">' +
			'<div class="table-cell">' +
				'<div class="tutorial-container">' +
					'<header>' +
					'<img src="images/tutorial-home.png"/>' +
					'Welcome to TalkLocal, The fastest way to get connected to quality pros. Let\'s get started!' +
					'</header>' +
					'<div class="buttons">' +
					'<div class="btn btn-block btn-info" ng-click="$appTutorial.activateStep(1);">Take the tour!</div>' +
					'<div class="btn btn-block btn-default" ng-click="$appTutorial.close()">No thanks</div>' +
					'<div class="btn btn-block btn-default" ng-click="$appTutorial.dontShowAgain()">Don\'t show again</div>' +
				'</div>' +
			'</div>' +
		'</div>'
	);
}]);

angular.module("templates/step1A.html", []).run(["$templateCache", function($templateCache) {
	$templateCache.put("templates/step1A.html",
		'<div class="tutorial-step1">' +
			'<div class="select-blurb" ng-style="{top : position.top, left : position.left}">' +
			'<div>First, pick a service you need help with!</div>' +
			'<div class="btn btn-primary" ng-if="Request.category" ng-click="$appTutorial.step1B()">' +
			'Continue ' +
			'<i class="fa fa-arrow-right"></i>' +
			'</div>' +
			'</div>'+
		'</div>'
	);
}]);

angular.module("templates/step1B.html", []).run(["$templateCache", function($templateCache) {
	$templateCache.put("templates/step1B.html",
		'<div>' +
			'<div class="select-blurb" ng-style="{top : position.description.top, left : position.description.left}">' +
			'<div>' +
			'Great, now, tell us where you need help!' +
			'</div>' +/*
			'<div class="pull-right button-description">' +
			'Or click here to get your current location!' +
			'</div>' +*/
			'<div class="btn btn-default" ng-if="User.isZipcodeValid()" ng-click="$appTutorial.step1A()">' +
			'<i class="fa fa-arrow-left"></i>' +
			' Back' +
			'</div>' +
			'<div class="btn btn-primary" ng-if="User.isZipcodeValid()" ng-click="$appTutorial.step1C()">' +
			'Continue ' +
			'<i class="fa fa-arrow-right"></i>' +
			'</div>' +
			'</div>'
	);
}]);

angular.module("templates/step1C.html", []).run(["$templateCache", function($templateCache) {
	$templateCache.put("templates/step1C.html",
		'<div>' +
			'<div class="select-blurb" ng-style="{top : position.description.top, left : position.description.left}">' +
			'Make sure these details look right, and click Next to continue!' +
			'</div>' +
		'</div>'
	);
}]);

angular.module("templates/step2A.html", []).run(["$templateCache", function($templateCache) {
	$templateCache.put("templates/step2A.html",
		'<div>' +
			'<div class="select-blurb" ng-style="{top : position.description.top, left : position.description.left}">' +
			'<div>' +
				'Tell us what you need a {{Request.category}} for<span class="tutorial-microphone-snippet">, or click the <i ui-sref="recording" class="fa fa-microphone small"></i> icon to record your description</span>. Provide specific information so we can find you the best match!' +
			'</div>' +
			'<div class="btn btn-primary" ng-disabled="!Request.isDescriptionValid() && !Recording.saved" ng-click="$appTutorial.step2B()">' +
			'<div ng-if="Request.isDescriptionValid() || Recording.saved">Continue <i class="fa fa-arrow-right"></i></div>' +
			'<div ng-if="!Request.isDescriptionValid() && !Recording.saved">7 words minimum</div>' +
		'</div>'
	);
}]);

angular.module("templates/step2B.html", []).run(["$templateCache", function($templateCache) {
	$templateCache.put("templates/step2B.html",
		'<div>' +
			'<div class="select-blurb" ng-style="{top : position.description.top, left : position.description.left}">' +
				'<div>' +
					'Cool! Now select a time you\'d like the service, or pick from the calendar' +
				'</div>' +
			'<div class="btn btn-default" ng-click="$appTutorial.step2A()">' +
			'<i class="fa fa-arrow-left"></i>' +
			' Back' +
			'</div>' +
			'<div class="btn btn-primary" ng-click="$appTutorial.step2C()">' +
			'Continue ' +
			'<i class="fa fa-arrow-right"></i>' +
			'</div>' +
			'</div>' +
		'</div>'
	);
}]);

angular.module("templates/step2C.html", []).run(["$templateCache", function($templateCache) {
	$templateCache.put("templates/step2C.html",
		'<div>' +
			'<div class="select-blurb" ng-style="{top : position.description.top, left : position.description.left}">' +
			'' +
			'</div>' +
		'</div>'
	);
}]);

angular.module("templates/stepTimetable.html", []).run(["$templateCache", function($templateCache) {
	$templateCache.put("templates/stepTimetable.html",
		'<div>' +
			'<div class="select-blurb" ng-style="{top : position.description.top, left : position.description.left}">' +
			'<div>' +
			'<strong><i class="fa fa-calendar"></i> Welcome to the Calendar Page!</strong>' +
			'From here you can choose times which are convenient for your service appointment, or press the back button to ' +
			'return to the previous page.' +
			'</div>' +
			'<div class="btn btn-info" ng-click="$appTutorial.stepTimetableB();">Ok, got it! <i class="fa fa-arrow-right"></i></i></div>' +
			'</div>'
	);
}]);

angular.module("templates/stepSettings.html", []).run(["$templateCache", function($templateCache) {
	$templateCache.put("templates/stepSettings.html",
		'<div>' +
			'<div class="select-blurb" ng-style="{top : position.description.top, left : position.description.left}">' +
			'<div>' +
			'<strong><i class="fa fa-cog"></i> Welcome to the Settings Page!</strong>' +
			'The information on this page is used to notify you of the status of your request.  We will <i>never</i> ' +
			'share your contact information with anyone!' +
			'</div>' +
			'<div class="btn btn-info" ng-click="$appTutorial.stepSettingsB();">Ok, got it! <i class="fa fa-arrow-right"></i></i></div>' +
			'</div>'
	);
}]);

angular.module("templates/stepRecording.html", []).run(["$templateCache", function($templateCache) {
	$templateCache.put("templates/stepRecording.html",
		'<div>' +
			'<div class="select-blurb" ng-style="{top : position.description.top, left : position.description.left}">' +
			'<div>' +
			'<strong><i class="fa fa-microphone"></i> Welcome to the Recording Page!</strong>' +
			'Here you can record your service description for businesses to hear.  We will send this recording along with your request!' +
			'</div>' +
			'<div class="btn btn-info" ng-click="$appTutorial.stepRecordingB();">Ok, got it! <i class="fa fa-arrow-right"></i></i></div>' +
			'</div>'
	);
}]);
