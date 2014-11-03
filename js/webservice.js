function generalHttpRequest(action, url, dataToUpload, resultsCallback,
		datapackage, errorCallback, logFunction) {
	var xhr = createCORSRequest(action, url);
	if (!xhr) {
		if (errorCallback) {
			errorCallback(null, datapackage);
		}
		if (logFunction)
			logFunction('CORS not supported');
//		alert('CORS not supported');
		return;
	}

	xhr.onload = function() {
		var text = xhr.responseText;
		if (logFunction)
			logFunction('response from ' + url + ' = ' + text);
		datapackage.status = xhr.statusText;
		datapackage.code = xhr.status;
		resultsCallback(text, datapackage);
	};

	xhr.onerror = function(e) {
		if (errorCallback) {
			datapackage.status = xhr.statusText;
			datapackage.code = xhr.status;
			errorCallback(null, datapackage);
		}
		if (logFunction)
			logFunction('Error code making the request to ' + url + ' = '
					+ e.error);
	};

	if (dataToUpload)
		xhr.send(dataToUpload);
	else
		xhr.send();
}

// from http://www.html5rocks.com/en/tutorials/cors/
// Create the XHR object.
function createCORSRequest(method, url) {
	var xhr;
	var browser = navigator.appName;
	if (browser == "Microsoft Internet Explorer") {
		// xhr = new ActiveXObject("Microsoft.XMLHTTP");
		xhr = new XDomainRequest();
		xhr.open(method, url);
	} else {
		xhr = new XMLHttpRequest();
		xhr.open(method, url, true);
	}
	// if ("withCredentials" in xhr) {
	// // XHR for Chrome/Firefox/Opera/Safari.
	// xhr.open(method, url, true);
	// } else if (typeof XDomainRequest != "undefined") {
	// // XDomainRequest for IE.
	// // xhr = new XDomainRequest();
	// xhr.open(method, url);
	// } else {
	// // CORS not supported.
	// xhr = null;
	// }
	return xhr;
}