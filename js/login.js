var AUTH_PREFIX = '/Image2000/rest/userservice/authenticateUser/';
var TESTING = window.location.hostname.indexOf('rco') < 0;
function resultsHandlerAuthentication(text, datapackage) {
	var validUser = false;
	if (text != null) {
		text = text.replace(/"/g, "").trim();
	}
	if (TESTING || text === "true") {
		validUser = true;
	}
	if (validUser) {
		sessionStorage.username = datapackage.username;
		sessionStorage.password = datapackage.password;
		sessionStorage.loginPage = document.URL;
		sessionStorage.isLoggedIn = "true";
		window.location.href = datapackage.nextUrl;
	} else {
		//alert('User not logged in');
	}
}
function authUser(username, password, nextUrl) {

	var url = AUTH_PREFIX + username + '/' + password + '/';
	var datapackage = {
		nextUrl : nextUrl,
		username : username,
		password : password
	};

	generalHttpRequest('GET', url, 0, resultsHandlerAuthentication, datapackage);
}
