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
                console.log("*The Url we're pinging for UPLOAD is: " + url);
				if(device.platform == "iOS") {
					options.mimeType="audio/wav";
				}
				else if(device.platform == "Android") {
					options.mimeType="audio/amr";
				}
                console.log("*Options mimetype: " + options.mimeType);
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
        permissionsStatus : 0, // O: Uknown (on start), 1: Good to record, 2: DENIED
        paused : 0,
        // set using "setAudio()" : mimeType : "audio/wav",
        // set using "setAudiio()" : audioType : "aiff",
		
        init : function(){
            // check for if file exists (it likely wont), so, create it.
            var self = this;
			self.setAudio();
            self.initialPromise = $q.defer();
            window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, self.gotFS, function fail(){});
            return self.initialPromise.promise;
        },
		
		setAudio : function(opt_mimeType) {
			if(opt_mimeType) {
				this.mimeType = opt_mimeType;
			}
			else if(device.platform == "Android") {
				this.mimeType = "audio/amr";
			}
			else {
				this.mimeType = "audio/wav";
			}
			
			var audioType = this.mimeType.split("/");
			audioType = audioType[1];
			this.audioType = audioType;
            // for iPhones, we need an aiff audiotype.  override it here
            if(this.audioType == "wav")
            	this.audioType = "aiff";
			console.log("Set recording's mimeType to: '" + this.mimeType + "' and audioType to: '" + this.audioType + "'");
		},
		
        gotFS : function(fileSystem) {
        	var self = this;
        	fileSystem.root.getFile("sc_recording.wav", {create: true, exclusive: false}, function(fileEntry){
            	Recording.gotFileEntry(fileEntry)
                }, function(){
                	alert("fail");
                }
            );
        },
		
		newMediaRec : function() {
			var self = this;
			console.log("Creating new media rec with src: " + self.toURL);
            if(device.platform == "Android"
            ) {
            	var mediaLocation = self.toURL;
            }
            else {
            	var mediaLocation = self.src;
            }
			self.mediaRec = new Media(mediaLocation,
                function(){
                }, function(err){
                	console.log("MediaError callback code: " + err.code);
                    console.log("MediaError callback message: " + err.message);
                    if(err.code == 1) {
                    	// permissions aborted / denied
                    	new xAlert(
                        	"To record audio, please enable audio permissions for this application from your devices settings page.", function(){}, "Recording Permissions Declined"
                        );
                        self.permissionsStatus = 2;
                    }
                }, function(statusChanged){
                	console.log("*Recording status has changed to: " + statusChanged);
                    //for reference:
                    //Media.MEDIA_NONE = 0;
                    //Media.MEDIA_STARTING = 1;
                    //Media.MEDIA_RUNNING = 2;
                    //Media.MEDIA_PAUSED = 3;
                    //Media.MEDIA_STOPPED = 4;
                    if(statusChanged == 2) {
                    	self.permissionsStatus = 1;
                    }
                    
           		}
            );
		},
		
        gotFileEntry : function(fileEntry) {
        	var self = this;
            self.toURL = fileEntry.toURL();
            self.src = fileEntry.fullPath;
            console.log("***Creating a media file at: " + fileEntry.fullPath);
        	self.newMediaRec();
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
						self.mediaRec.release();
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
                self.interval = $interval(function(){
                	if(self.permissionsStatus == 1) {
                		self.recording = true;
                        self.length += .1;
                        self.lengthToString = self.length.toString().toHHMMSS();
                        console.log("*Recording Length: " + self.length);
                    }
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
				self.newMediaRec();
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