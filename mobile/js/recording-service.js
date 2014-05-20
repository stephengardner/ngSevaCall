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
myApp.factory('Recording', function($timeout, $interval, User, $http, $q){
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
            if(self.saved) {
                alert("Are you sure you want to delete the details recording?");
                return false;
            }
            self.recording = true;
            self.interval = $interval(function(){
                self.length += .1;
                self.lengthToString = self.length.toString().toHHMMSS();
                console.log(self.length);
            }, 100);
        },

        stopRecord : function() {
            var self = this;
            self.recording = false;
            self.saved = true;
            $interval.cancel(self.interval);
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
            }, 100);
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