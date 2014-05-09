/*
 * Overlay object, adds an overlay to the dom when calling the "add" function.  Remove it with the "remove" function
 */

var Overlay = function(opts){
	this.isActive = false;
	this.isActiveWithSpinner = false;
	this.overlayBackground = $("<div class='overlay'></div>");
	this.overlaySpinner = $("<div class='overlay-spinner'><img src='img/ajax_loader.gif'/></div>");
    if(opts.styleBackground){
        this.overlayBackground[0].setAttribute("style", opts.styleBackground);
    }
	this.body = $("body");
};

Overlay.prototype = {
	add : function(opt_spinner) {
		if(opt_spinner && !this.isActiveWithSpinner) {
			this.isActiveWithSpinner = true;
            this.isActive = true;
			this.body.append($(this.overlayBackground).append(this.overlaySpinner));
		}
		else if(!this.isActive){
            this.isActive = true;
			this.body.append(this.overlayBackground);
		}
        else if(this.isActive && !opt_spinner){
            this.isActiveWithSpinner = false;
            this.overlaySpinner.remove();
        }
	},
	remove : function() {
        this.isActive = this.isActiveWithSpinner = false;
		this.overlayBackground.remove();
		this.overlaySpinner.remove();
	}
};