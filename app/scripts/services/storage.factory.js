myApp.factory('Storage', ['User', 'Request', '$localStorage', function(User, Request, $localStorage) {
	var Storage = {
		name : false,
		email : false,
		phone : false,
		zip : false,
		recordingModalDismissed : false,
		tutorialDismissed : false,

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
			this.email = $localStorage.sc_user_email;
			this.phone = $localStorage.sc_user_phone;
			this.zip = $localStorage.sc_user_zip;
			this.tutorialDismissed = $localStorage.tl_tutorial_dismissed;
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
			$localStorage.tl_tutorial_dismissed = this.tutorialDismissed;
			$localStorage.sc_recordingModalDismissed = this.recordingModalDismissed;
		},

		empty : function() {
			$localStorage.$reset();
		}
	};
	return Storage;
}]);