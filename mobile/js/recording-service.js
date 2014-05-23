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
            url : "http://www.sevacall.com/uploadTest.php",
            success : function(r) {
                console.log("Code = " + r.responseCode);
                console.log("Response = " + r.response);
                console.log("Sent = " + r.bytesSent);
            },
            fail : function(error) {
                alert("An error has occurred when sending your recording: Code = " + error.code);
                console.log("upload error source " + error.source);
                console.log("upload error target " + error.target);
            },
            uploadRecording : function(Recording) {
                var self = this;
                var uri = encodeURI(self.url);
                var fileURL = Recording.src;
                console.log("File url is: " + fileURL);
                var options = new FileUploadOptions();
                options.fileKey="file";
                options.fileName=fileURL.substr(fileURL.lastIndexOf('/')+1);
                options.mimeType="audio/wav";
                options.headers = {
                    Connection: "close"
                }
                options.chunkedMode = false;

                var ft = new FileTransfer();
                ft.onprogress = function(progressEvent) {
                    if (progressEvent.lengthComputable) {
                      loadingStatus.setPercentage(progressEvent.loaded / progressEvent.total);
                    } else {
                      loadingStatus.increment();
                    }
                };
                ft.upload(fileURL, uri, self.success, self.fail, options);
            }
            
        };
        return Uploader;
});
myApp.factory('Recording', function($timeout, $interval, User, $http, $q, $rootScope, Uploader){
    var Recording = {
        length : 0,
        position : 0,
        lengthToString : "",
        positionToString : "",
        playing : 0,
        paused : 0,
        src : "recording10",
        mimeType : "audio/wav",
        init : function(){
            // check for if file exists (it likely wont), so, create it.
            var self = this;
            console.log("init");
            self.initialPromise = $q.defer();//$.Deferred();
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, self.createFile, function fail(){});
            //alert();
            //self.initialPromise.resolve(true);
            return self.initialPromise.promise;
            
        },
        createMediaRec : function() {
            var self = this;
            /*
        	alert("!");
        	var onSuccess = function(){
             	alert("DONE");
            };
            var onError = function() {
        		alert("err");
                console.log(err.code)
            };
            //self.createMediaRecPromise = $q.defer();
            */
            console.log("Creating media rec with src: " + self.getSrc().replace("file://", ""));
            self.mediaRec = new Media(self.getSrc().replace("file://", ""),
                function(){
                	alert("success");
                }, function(err){
                	alert("err");
                    console.log(err.message);
                }, function(){
            		alert("stat");
           		}
            );
            //Recording.createMediaRecPromise.resolve(true);
            //return self.createMediaRecPromise.promise;
            return true;
        },
        createFile : function(fileSystem) {
            // create a recording file if it doesn't exist.  This is necessary to record into later.
            var self = this;
            var deferred = $q.defer();//$.Deferred();
            var fileName = "recording10.wav"; // must be set here to be used in .getFile, not on outer scope
            fileSystem.root.getFile(fileName, {create: true, exclusive: false}, success, fail);
            function success(entry) {
                Recording.setSrc(entry.toURI());
                console.log("-----------------filepath for recording: " + Recording.getSrc());
                Recording.initialPromise.resolve(true);
                deferred.resolve(true);
                //SCRecording.initialPromise.resolve(true);
            };
            function fail(){alert("FAIL");console.log("Could not create the recording file");};
            return deferred.promise;
        },
        getSrc : function(){
            return this.src;
        },
        setSrc : function(src){
            console.log("setting source: " + src);
            this.src = src;
        },
        send : function(){
            // send the recording to the sevacall server using the Uploader object
            Uploader.uploadRecording(this);
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