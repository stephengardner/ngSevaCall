function APIV2(){}
APIV2.prototype = {
	ping : function(endpoint, options, callback) {
		// set the temporary api key for now inline
		options["key"] = "tmp";
		// the button uses the "next_page" attribute, but the api wants a "page" so as not to be overly confusing, we switch them here, at the last step before pinging the API
		//
		if(options['next_page']) {
			options['page'] = options['next_page'];
			options['next_page'] = "";
		}
		options['actionType'] = options['actionType'] ? options['actionType'] : "GET";
		$.ajax({
			url : base + "" + endpoint,
			type : options['actionType'],
			data : options,
			success : function(response) {
				if(callback)
					callback(response);
			},
			error : function(response) {
			
			}
		});
	},
}
var APIV2 = new APIV2();

function APIV2Actions(){}
APIV2Actions.prototype = {
	favoriteSubmit : function(options, button) {
		options.name = $("#favorites-list-name").val();
		APIV2.ping("api/v2/" + options.endpoint, options, function(data) {
			console.log(data);
		});
		
	}
};
function APIV2Callbacks(){}
APIV2Callbacks.prototype = {
	popular : function(result, options, button) {
		var pagination = result.pagination;
		button.attr("data-pagination", JSON.stringify(pagination));
		var loadNew = $("<div>").html(result.HTML);
		loadNew.find(".tag").each(function(){
			$(this).hide();
			$(options.target).append($(this));
			$(options.target).append("&nbsp;"); // span tags
		});
		$(options.target + " .tag").fadeIn(700);
		
		loadNew.find(".author").each(function(){
			$(this).hide();
			$(options.target).append($(this));
			$(options.target).append("&nbsp;"); // span tags
		});
		$(options.target + " .author").fadeIn(700);
	},
	
	favoritesLists : function(result, options, button) {
		if($(button).find(".fa-heart").hasClass("active")) {
			$(options.target + "-popup").show();
			$(options.target).html(result.HTML).show();
			console.log(result);
		}
		else {
			$(options.target + "-popup").hide();
		}
	}
}

var APIV2Callbacks = new APIV2Callbacks();
var APIV2Actions = new APIV2Actions();
$(document).ready(function(){

	$("body").delegate(".APIV2", "click", function() {
		var options =  $.parseJSON($(this).attr("data-options"));
		var $this = $(this); // necessary to update the button's pagination after calling back or during action
		
		// if there is an immediate action, process it, otherwise proicess as normal
		if(options.action) {
			APIV2Actions[options.action](options, $this);
			return;
		}
		else {
			if($(this).attr("data-pagination")) {
				var pagination =  $.parseJSON($(this).attr("data-pagination"));
				var next_page = pagination.next_page ? pagination.next_page : 1;
				options['next_page'] = next_page;
			}
			console.log("APIV2 - OPTIONS: ", options);
			APIV2.ping("api/v2/" + options.endpoint, options, function(data) {
				APIV2Callbacks[options.callback](data, options, $this);
			});
		}
	});
});