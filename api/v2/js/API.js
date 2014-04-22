function APIV2(){}
APIV2.prototype = {
	ping : function(endpoint, options, callback) {
		console.log("APIV2 - PING: " + endpoint);
		$.ajax({
			url : base + "" + endpoint,
			type : "GET",
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