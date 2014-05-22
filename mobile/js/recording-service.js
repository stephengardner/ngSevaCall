String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    //if (hours   < 10) {hours   = "0"+hours;}
    //if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = /*hours+':'+*/minutes+':'+seconds;
    return time;
}
myApp.factory('Recording', function($timeout, $interval, User, $http, $q, $rootScope){
    var Recording = {
        length : 0,
        position : 0,
        lengthToString : "",
        positionToString : "",
        playing : 0,
        paused : 0,

        init : function() {

        },

        startRecord : function() {
            var self = this;
            var deferred = $q.defer();
            if(self.saved) {
                if(self.playing) {
                    self.pause();
                }
                new xAlert("Are you sure you want to delete the details recording?",
                function(button){
                    if(button == 1) {
                        self.recording = 0;
                        self.reset();
                        $rootScope.$apply(); // necessary to call this on the asynchronous service xAlert. the promises are not taking care of this
                        deferred.resolve(self);
                    }
                    else {
                        deferred.resolve(self);
                    }
                },
                "Alert",
                "Yes, No");
            }
            else {
                self.recording = true;
                self.interval = $interval(function(){
                    self.length += .1;
                    self.lengthToString = self.length.toString().toHHMMSS();
                    console.log(self.length);
                }, 100);
                deferred.resolve(self);
            }
            return deferred.promise;
        },

        stopRecord : function() {
            var self = this;
            self.recording = false;

            $interval.cancel(self.interval);
            if(self.length < 3) {
                new xAlert("Recording must be at least 3 seconds");
                self.reset();
            }
            else {
                self.saved = true;
            }
        },

        toggleRecord : function() {
            var self = this;
            if(!self.recording)
                self.startRecord();
            else if(self.recording) {
                self.recording = false;
                self.stopRecord();
            }
        },

        togglePlay : function() {
            var self = this;
            self.stopRecord();
            if(self.playing){
                self.pause();
            }
            else if (!self.playing) {
                self.play();
            }
        },

        play : function() {
            var self = this;
            self.playing = 1;
            self.paused = 0;
            self.playInterval = $interval(function(){
                self.position += .1;
                self.positionToString = self.position.toString().toHHMMSS();
                if(self.position >= self.length) {
                    self.stop();
                }
            }, 100);
        },

        reset : function() {
            var self = this;
            self.position = 0;
            self.playing = 0;
            self.paused = 0;
            self.length = 0;
            self.recording = false;
            self.saved = false;
            self.positionToString = "";
            self.lengthToString = "";
        },

        rewind : function() {
            self.playing = 0;
            self.paused = 0;
        },

        pause : function(){
            var self = this;
            self.paused = 1;
            self.playing = 0;
            $interval.cancel(self.playInterval);
        },

        stop : function() {
            var self = this;
            self.playing = 0;
            self.paused = 0;
            self.position = 0;
            $interval.cancel(self.playInterval);
        }

    };
    /*
    Recording.startRecord();
    $timeout(function(){
        Recording.play();
    }, 3000);
    $timeout(function(){
        Recording.pause();
    }, 3000);
    */
    return Recording;
});