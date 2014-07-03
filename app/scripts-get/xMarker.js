function xMarker(latlng,  map, companyObject, markerNumber) {
	this.latlng_ = latlng;

	this.company = companyObject;

	this.markerNumber_ = markerNumber ? markerNumber : "?";
	// Once the LatLng and text are set, add the overlay to the map.  This will
	// trigger a call to panes_changed which should in turn call draw.
	this.setMap(map);
}

xMarker.prototype = new google.maps.OverlayView();

xMarker.prototype.draw = function() {
	var me = this;

	// Check if the div has been created.
	var div = this.div_;
	var markerNumber = this.markerNumber_;

	if (!div) {
		// Create a overlay text DIV
		div = this.div_ = document.createElement('div');
		div.className = "SCMapMarker";
		div.setAttribute("rel", markerNumber);

		google.maps.event.addDomListener(div, "click", function(event) {
		google.maps.event.trigger(me, "click");
		});

		// Then add the overlay to the DOM
		var panes = this.getPanes();
		panes.overlayImage.appendChild(div);
	}

	// Position the overlay
	var point = this.getProjection().fromLatLngToDivPixel(this.latlng_);
	if (point) {
		this.setPixelOffset();
		div.style.left = point.x - this.pixelOffsetWidth + 'px';
		div.style.top = point.y - this.pixelOffsetHeight + 'px';
	}
};

xMarker.prototype.setPixelOffset = function() {
	if(this.div_) {
		this.pixelOffsetWidth = this.div_.clientWidth / 2;
		this.pixelOffsetHeight = this.div_.clientHeight;
	}
	else {
		this.pixelOffsetWidth = 0;
		this.pixelOffsetHeight = 0;
	}

}
xMarker.prototype.remove = function() {
	// Check if the overlay was on the map and needs to be removed.
	if (this.div_) {
		this.div_.parentNode.removeChild(this.div_);
		this.div_ = null;
	}
};

xMarker.prototype.getPosition = function() {
	return this.latlng_;
};

function addOverlay() {
	overlay.setMap(map);
}

function removeOverlay() {
	overlay.setMap(null);
}
