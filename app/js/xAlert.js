/**
 * @xAlert
 * @author: Stephen Gardner
 * @arguments: (str) message, (func) callback, (str) opt_title, (str) opt_buttons
 * @description: Helper JS Class to display a custom alert popup box for either a web-based or phonegap-based application
 **/
Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = 0, len = this.length; i < len; i++) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}
function xAlert(options) {
    var self = this;
    self.defaults = {
        title	: "Error Alert",
        content : "",
        orientation : "horizontal",
        callback : function(){}
    };

    // use user-specified options, else use defaults
    //
    for (k in self.defaults)	{
        if (typeof(self[k]) != typeof(self.defaults[k]))
            self[k] = self.defaults[k];
    }

    self.content = arguments[0] ? arguments[0] : self.defaults.content;
    self.callback = arguments[1] ? arguments[1] : self.defaults.callback;
    self.title = arguments[2] ? arguments[2] : self.defaults.title;
    self.buttons = arguments[3] ? arguments[3].split(",") : ["Dismiss"];
    self.mainButtons = self.buttons.filter(function(elem, index, array){
        if(self.buttons[index].indexOf("#") != -1 && (self.buttons[index] = self.buttons[index].replace("#", "")))
            return true;
    });
    try {
        if(isPhoneGap) {
            return navigator.notification.confirm(self.content, self.callback, self.title , self.buttons.toString());
        }
    } catch(e) {

    }
    self.cancelTouchMove = function cancelTouchMove( e ) {
        alert("cancel");
        e.preventDefault();
        e.stopPropagation();
        return false;
    };

    self.init();
}

xAlert.prototype = {

    init : function(){
        var self = this;

        self.setOverlay();
        self.setPopup();
        self.setButtons();

        self.create();
    },

    create : function( ) {
        var self = this;
        $(".alert-wrapper").remove();
        $(".alert-overlay").remove();
        // necessary to blur inputs on some android phones where the input element forces a higher z-index than the alert box
        $("input").blur();
        //PageSnap();
        //$("body").animate({ scrollTop: 1 }, 400);
        // append overlay and alert container
        //

        document.body.appendChild(self.overlay);
        document.body.appendChild(self.popup);

        // append all buttons to alert container
        //
        for(var i = 0; i < self.buttonsArray.length; i++) {
            self.popup.querySelector(".alert-buttons").appendChild(self.buttonsArray[i]);
        }

        self.disableScrolling();
    },

    destroy : function() {
        var self = this;
        // classes to fade out
        //
        //self.popup.className+= " destroy";
        //self.overlay.className+= " destroy";

        // after fade out, remove DOM elements
        //
        setTimeout(function(){
            document.body.removeChild(self.popup);
            document.body.removeChild(self.overlay);
        }, 100);

        self.enableScrolling();

    },

    disableScrolling : function() {
        $("body").bind("touchmove", this.cancelTouchMove);
        //document.body.addEventListener("touchmove", this.cancelTouchMove);
    },

    enableScrolling : function() {
        $("body").off("touchmove");
        //document.body.removeEventListener("touchmove", this.cancelTouchMove);
    },

    setOverlay : function() {
        var self = this;
        self.overlay = document.createElement("div");
        self.overlay.className = "alert-overlay";

        // apply a window-specific radial gradient to accomodate for the pixel-specific radial gradient syntax which is the most widely supported syntax (otherwise, use percentage-based)
        //
        var bg =  "background-image: -webkit-gradient(radial, 50% 50%, 0, 50% 50%, " + window.screen.width + ", color-stop(0%, rgba(0, 0, 0, 0.00)), color-stop(100%, rgba(0, 0, 0, 0.55)));";
        bg += "background-image: -moz-radial-gradient(center center, 50% 100%, rgba(0, 0, 0, 0.0) 0%, rgba(0, 0, 0, 0.55) 100%);";
        bg += "background-image: -webkit-gradient(radial, 50% 50%, 0, 50% 50%, 114, color-stop(0%, rgba(0, 0, 0, 0.55)), color-stop(100%, rgba(0, 0, 0, 0.55)));"
        bg += "background-image: -webkit-radial-gradient(center center, 100% 100%, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.55) 100%);"
        bg += "background-image: -moz-radial-gradient(center center, 100% 100%, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.55) 100%);"
        bg += "background-image: -ms-radial-gradient(center center, 100% 100%, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.55) 100%);"
        bg += "background-image: -o-radial-gradient(center center, 100% 100%, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.55) 100%);"
        bg += "background-image: radial-gradient(100% 100% at center center, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.55) 100%);"
        self.overlay.setAttribute("style", bg);
    },

    setPopup : function() {
        var self = this;
        self.popup = document.createElement("div");
        self.popup.className = "alert-wrapper";

        // Use innerHTML instead of creating several extra DOM elements and appending them
        //
        var innerHTML = 	'	<div class="alert-vertical-center">';
        innerHTML += 	'	<div class="alert">';
        innerHTML += 	'	<div class="highlight">';
        innerHTML +=	'	</div>';
        innerHTML += 	'	<div class="alert-content">';
        innerHTML +=    '		<div class="alert-title">';
        innerHTML +=    '			' + self.title;
        innerHTML +=    '		</div>';
        innerHTML +=    '		'+self.content+'';
        innerHTML +=	'		<div class="alert-buttons">';
        innerHTML +=	'		</div>';
        innerHTML +=	'	</div>';
        innerHTML +=	'	</div>';
        innerHTML +=	'	</div>';

        self.popup.innerHTML = innerHTML;
    },

    setButtons : function() {
        var self = this;
        self.buttonsArray = [];
        var count = self.buttons.length;

        for(var i = 0; i < count; i++) {
            var button = document.createElement("div");
            var	width = (count > 1 && self.orientation == "horizontal") ? ((100 - ( count - 1 )) / count) : 100;
            button.className = "alert-button";
            button.className += self.mainButtons[i] ? " main" : "";
            button.style.width = width+"%";
            button.innerHTML = self.buttons[i];
            button.setAttribute("data-buttonNumber", i+1);
            button.addEventListener("click", function(e){self.callback(this.getAttribute("data-buttonNumber")); self.destroy();});
            self.buttonsArray.push(button);
        }
    }
}