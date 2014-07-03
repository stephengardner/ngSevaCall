
/**
 * Created by Developer on 7/2/14.
 */
app.initialize();
if(isPhoneGap) {
	document.addEventListener('deviceready',function(){
		angular.bootstrap(document, ["myApp"]);
	});
}
else {
	try {
	// Wrap this call to try/catch
	angular.bootstrap(document, ['myApp']);
	}
catch (e) {
	console.error(e.stack || e.message || e);
	}
}