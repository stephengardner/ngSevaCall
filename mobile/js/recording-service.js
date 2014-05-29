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
myApp.factory('Uploader', function($q) {
		var Uploader = {
            url : api_root + "components/audio-upload/upload.php",
            success : function(r) {
                console.log("Code = " + r.responseCode);
                console.log("Response = " + r.response);
                console.log("Sent = " + r.bytesSent);
                Uploader.uploadPromise.resolve(r);
            },
            fail : function(error) {
                new xAlert("An error has occurred when sending your recording: Code = " + error.code);
                console.log("upload error source " + error.source);
                console.log("upload error target " + error.target);
                Uploader.uploadPromise.reject(error);
            },
            uploadRecording : function(src, opts) {
                var self = this;
                self.uploadPromise = $q.defer();
                var url = encodeURI(self.url + "?" + $.param(opts));
                var fileURL = src;
                console.log("File url is: " + fileURL);
                var options = new FileUploadOptions();
                options.fileKey="file";
                options.fileName=fileURL.substr(fileURL.lastIndexOf('/')+1);
                options.mimeType="audio/wav";
                /*
                options.headers = {
                    Connection: "close"
                }
                */
                options.chunkedMode = false;

                var ft = new FileTransfer();
                ft.onprogress = function(progressEvent) {
                    if (progressEvent.lengthComputable) {
                      loadingStatus.setPercentage(progressEvent.loaded / progressEvent.total);
                    } else {
                      loadingStatus.increment();
                    }
                };
                ft.upload(fileURL, url, self.success, self.fail, options);
                return self.uploadPromise.promise;
            }
            
        };
        return Uploader;
});
myApp.factory('Recording', function($timeout, $interval, User, $http, $q, $rootScope){
    var Recording = {
        length : 0,
        position : 0,
        lengthToString : "",
        positionToString : "",
        playing : 0,
        paused : 0,
        mimeType : "audio/wav",
        audioType : "aiff",
        init : function(){
            // check for if file exists (it likely wont), so, create it.
            var self = this;
            self.initialPromise = $q.defer();
            window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, self.gotFS, function fail(){});
            return self.initialPromise.promise;
        },
        gotFS : function(fileSystem) {
        	var self = this;
        	fileSystem.root.getFile("test2.wav", {create: true, exclusive: false}, function(fileEntry){
            	Recording.gotFileEntry(fileEntry)
                }, function(){
                	alert("fail");
                }
            );
        },
        gotFileEntry : function(fileEntry) {
        	var self = this;
            self.toURL = fileEntry.toURL();
            self.src = fileEntry.fullPath;
            
        	self.mediaRec = new Media(fileEntry.fullPath,
                function(){
                }, function(err){
                    console.log(err.message);
                }, function(){
           		}
            );
            Recording.initialPromise.resolve(true);
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
                        self.recording = false;
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
            	self.mediaRec.startRecord(); //
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
		reset : function() {
        	this.length = 0;
            this.position = 0;
            this.lengthToString = "";
            this.positionToString = "";
            this.playing = 0;
            this.paused = 0;
            this.saved = 0;
        },
        stopRecord : function(opt_disableAlert) {
            var self = this;
            self.recording = false;
            self.mediaRec.stopRecord(); //
            // if we call stopRecord to switch pages and this item is playing, stop it.
			if(self.playing) {
            	self.stop();
            }
            $interval.cancel(self.interval);
            if(self.length < 3 && testingType != "recording" && !opt_disableAlert) {
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
            self.mediaRec.play(); //
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
            self.mediaRec.pause(); //
            self.paused = 1;
            self.playing = 0;
            $interval.cancel(self.playInterval);
        },

        stop : function() {
            var self = this;
            if(self.playing) {
            	self.mediaRec.pause();
            }
            self.mediaRec.stop(); //
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