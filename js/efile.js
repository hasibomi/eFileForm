var AUTH_REQUIRED = 1;
var TESTING = window.location.hostname.indexOf('rco') < 0;
var DEBUG = 1;
var OBJECTTYPE = 'NRT165';
var LOGIN = 'rwc145@gmail.com'; // will be removed
var PASSWORD = '123'; // will be removed
var USE_KEY = true;

var SCREEN_TYPE = 'BOTH';

var SUPPORTED_FILES = [ 'pdf', 'jpg', 'jpeg' ];

var SERVICE_ROOT = '/Image2000/';
var SERVICE_PREFIX = SERVICE_ROOT + 'rest/directoryservice/';
var DOWNLOAD_FILE_PREFIX = SERVICE_ROOT + 'ImgServer';

var GET_FILE_ID_URL = SERVICE_PREFIX + 'createRecordInDirectory/';
var UPLOAD_FILE_URL = SERVICE_ROOT + 'rest/recordservice/setRecordContent/';

var GET_TOP_FOLDERS = 'getFileFolders/';
var GET_CHILDREN = 'getChildrenByTreeId/';
var GET_EFILE_PATH = 'getEfileDownloadPath/';
var EFILE_POSTFIX = '/eFile/';
131
var EFILE_OBJECT_TYPE = '/NRT165/';

var PDF_VIEWER_PREFIX = '/Image2000/i2k/Forms/eFileForm/pdfjs/web/viewer.html?file=';
var TEST_PDF_VIEWER_PREFIX = 'pdfjs/web/viewer.html?file=';

var DELETE_URL = SERVICE_PREFIX + 'deleteEfileDownloadPath/json/json/';
var SECONDS_DELAY_FOR_DELETE = 10;

var UPLOAD_SUCCESS_TEXT = '1 file sent.';

function remove(id) {
	var temp = document.getElementById(id);
	if (temp) {
		temp.parentNode.removeChild(temp);
	}
}

function setFilenameForDownload(fileUrl, filename) {
	var anchorElem = $("#downloadanchor")[0];
	var fname = '';
	if (filename) {
		fname = filename;
	}
	if (fileUrl) {
		anchorElem.setAttribute('download', fname);
		anchorElem.setAttribute('href', unescape(fileUrl));
	} else {
		anchorElem.removeAttribute('download');
		anchorElem.removeAttribute('href');
	}

}

function injectIframeWithViewer(divId, documentId, documentName) {
	changeFileHighlight(documentId);
	remove('documentviewer');

	if (TESTING) {
		documentId = null;
		documentName = 'IMAG0295.jpg';
	}

	documentHandler(divId, documentId, documentName);

}

var delay = (function() {
	var timer = 0;
	return function(callback, ms) {
		clearTimeout(timer);
		timer = setTimeout(callback, ms);
	};
})();

function resizeContent() {
	delay(function() {
		resizeIframe();
		resizeJpg();
	}, 250);

}

function resizeIframe() {
	var iframe = $("#documentviewer")[0];
	var parent = $("#filecontent")[0];

	if (SCREEN_TYPE != 'BOTH') {
		parent.style.width = '100%';
		parent.style.height = '100%';
		parent.style.position = 'absolute';
		parent.style.top = '52px';
		iframe.removeAttribute('width');
		iframe.removeAttribute('height');
	}

	if (parent && iframe) {
		var w = parent.style.width;
		var h = parent.style.height;
		iframe.style.width = w;
		iframe.style.height = h;
	}
}

function resizeJpg() {
	var parent = $("#filecontent")[0];
	if (!parent)
		return;
	var image = $(parent).find("img")[1];
	if (image) {
		// alert('resizing '+image.getAttribute('src'));
		var parentWidth = screen.width;
		var parentHeight = screen.height;
		if (SCREEN_TYPE == 'BOTH') {
			parentWidth = parseInt(parent.style.width);
			parentHeight = parseInt(parent.style.height);
		}

		var width = image.width;
		var height = image.height;

		var ratio = width / height; // image ratio
		var newW = 0;
		var newH = 0;
		if (width > height) // image is landscape so fill width and set height
		{
			newW = parentWidth;
			newH = newW / ratio;
			if (newH > parentHeight) // scale again
			{
				newH = parentHeight;
				newW = newH * ratio;
			}
		} else // image is portrait mode
		{
			newH = parentHeight;
			newW = newH * ratio;
			if (newW > parentWidth) // scale again
			{
				newW = parentWidth;
				newH = newW / ratio;
			}
		}
		// alert(parentWidth + " " + parentHeight + " " + newW + " " + newH);

		image.width = newW;
		image.height = newH;
		image.parentNode.style.width = newW + 'px';
		image.parentNode.style.height = newH + 'px';

		if (SCREEN_TYPE != 'BOTH') {
			parent.style.width = newW + 'px';
			parent.style.height = newH + 'px';
			parent.style.position = 'absolute';
			parent.style.top = '0px';
		}

	}
	hideSpinner();
}

function addPdfToViewport(divId, fileUrl) {
	var entireUrl = (TESTING ? TEST_PDF_VIEWER_PREFIX : PDF_VIEWER_PREFIX)
			+ fileUrl;
	var parent = $("#" + divId)[0];
	var line = document.createElement("iframe");
	line.setAttribute('id', 'documentviewer');
	line.setAttribute('src', entireUrl);
	line.setAttribute('width', '920');
	line.setAttribute('height', '680');
	line.setAttribute('fileurl', unescape(fileUrl));
	line.setAttribute('fileext', 'pdf');
	line.onload = hideSpinner;
	parent.appendChild(line);
	resizeIframe();
}

function addGoogleDocToViewport(divId, fileUrl, fileExt) {
	var parent = $("#" + divId)[0];
	var protocol = window.location.protocol;
	var host = window.location.host;
	fileUrl = protocol + '//' + host + fileUrl;
	// alert(fileUrl);
	var pathForViewer = 'https://docs.google.com/gview?url=' + fileUrl
			+ '&embedded=true';
	var line = document.createElement("iframe");
	line.setAttribute('id', 'documentviewer');
	line.setAttribute('src', pathForViewer);
	line.setAttribute('width', '920');
	line.setAttribute('height', '680');
	line.setAttribute('fileurl', unescape(fileUrl));
	line.setAttribute('fileext', fileExt);
	line.onload = hideSpinner;
	parent.appendChild(line);
	resizeIframe();
}

function getFileExt(name) {
	fileExt = name.split('.').pop();
	fileExt = fileExt.toLowerCase();
	return fileExt;
}

// function resultsHandlerGetDocumentUrl(text, datapackage) {
// if (!text)
// return;

// var texttrimmed = text;// .replace(/"/g, "").trim();
// if (texttrimmed === 'Server caught internal exception'
// || texttrimmed === 'Internal Server Error') {
// hideSpinner();
// return;
// }
// var filename = datapackage.documentName;

// var fileUrl = texttrimmed;
// var divId = datapackage.divId;
// if (fileUrl != null) {
// setFilenameForDownload(fileUrl, filename);
// var fileExt = getFileExt(filename);
// //var index = SUPPORTED_FILES.indexOf(fileExt);
// //if (false && index < 0)// unsupported file
// //{
// //displayError(fileExt + ' is an unsupported file extension',
// //'filecontent');
// //hideSpinner();
// //} else
// {

// if (isPdf(fileExt)) {
// addPdfToViewport(divId, fileUrl);
// } else if (isJpg(fileExt)) {// jpg and jpeg
// addJpgToViewport(divId, fileUrl);
// } else {
// fileUrl += '%26filename%3d' + filename;
// addGoogleDocToViewport(divId, fileUrl, fileExt);
// }
// logToConsole('display for documentId = ' + datapackage.documentId
// + ' and filename = ' + filename);
// logToConsole('displaying file at ' + fileUrl);
// logToConsole('unescaped = ' + unescape(fileUrl));
// }
// }
// }

function resultsHandlerGetDocumentUrl(text, datapackage) {
	if (!text)
		return;

	var texttrimmed = text.replace(/"/g, "").trim();
	if (texttrimmed === 'Server caught internal exception'
			|| texttrimmed === 'Internal Server Error') {
		hideSpinner();
		return;
	}

	var fileUrl = texttrimmed;
	var filename = datapackage.documentName;
	var divId = datapackage.divId;
	if (fileUrl != null) {
		setFilenameForDownload(fileUrl, filename);
		var fileExt = getFileExt(fileUrl); // filename?
		// var index = SUPPORTED_FILES.indexOf(fileExt);
		// if (false && index < 0)// unsupported file
		// {
		// displayError(fileExt + ' is an unsupported file extension',
		// 'filecontent');
		// hideSpinner();
		// }
		// else
		{
			if (isPdf(fileExt)) {
				addPdfToViewport(divId, fileUrl);
			} else if (isJpg(fileExt)) {// jpg and jpeg
				addJpgToViewport(divId, fileUrl);
			} else {
				addGoogleDocToViewport(divId, fileUrl, fileExt);
			}
			logToConsole('display for documentId = ' + datapackage.documentId
					+ ' and filename = ' + filename);
			logToConsole('displaying file at ' + fileUrl);
			logToConsole('unescaped = ' + unescape(fileUrl));
			// setTimeout(function() {
			// deleteFileOnServer(fileUrl)
			// }, SECONDS_DELAY_FOR_DELETE * 1000);
			movePanels(true);
		}
	}
}

function resultsHandlerGetFolderFiles(text, datapackage) {
	var folderContainerId = datapackage.folderContainerId;
	var filesContainerId = datapackage.filesContainerId;
	var thisFolderId = datapackage.thisFolderId;
	var idsToRoot = datapackage.idsToRoot;

	if (text)
		processResults(folderContainerId, filesContainerId, thisFolderId,
				idsToRoot, text);
	else
		processResults(folderContainerId, filesContainerId, thisFolderId,
				idsToRoot, null);
}

// function documentHandler(divId, documentId, documentName) {
// showSpinner();
// var datapackage = {
// divId : divId,
// documentName : documentName,
// documentId : documentId
// };
// if (documentId == null)// for testing only.
// {
// resultsHandlerGetDocumentUrl(documentName, datapackage);
// } else {
// var url = DOWNLOAD_FILE_PREFIX + '%3fobjType%3d' + OBJECTTYPE
// + '%26id%3d' + documentId + '%26vindex%3d-1%26login%3d' + LOGIN
// + '%26passwd%3d' + PASSWORD;
// resultsHandlerGetDocumentUrl(url, datapackage);
// //var key = USE_KEY ? PASSWORD : ' ';
// //var url = '' + SERVICE_PREFIX + GET_EFILE_PATH + LOGIN + '/' +
// //PASSWORD
// //+ '/' + key + '/' + documentId + EFILE_OBJECT_TYPE;

// //generalHttpRequest('GET', url, null, resultsHandlerGetDocumentUrl,
// //datapackage, null, logToConsole);
// }
// }

function documentHandler(divId, documentId, documentName) {
	showSpinner();
	var datapackage = {
		divId : divId,
		documentName : documentName,
		documentId : documentId
	};
	if (documentId == null)// for testing only.
	{
		resultsHandlerGetDocumentUrl(documentName, datapackage);
	} else {
		var key = USE_KEY ? PASSWORD : ' ';
		var url = '' + SERVICE_PREFIX + GET_EFILE_PATH + LOGIN + '/' + PASSWORD
				+ '/' + key + '/' + documentId + EFILE_OBJECT_TYPE;

		generalHttpRequest('GET', url, null, resultsHandlerGetDocumentUrl,
				datapackage, null, logToConsole);
	}
}

function createUrl(parts, keys, values) {
	var txt = "";
	if (!parts)
		return txt;
	for (i = 0; i < parts.length; i++) {
		if (i != 0)
			txt += '/';
		txt += parts[i];
	}
	if (keys && values && keys.length == values.length) {
		txt += '/';
		for (i = 0; i < parts.length; i++) {
			if (i == 0)
				txt += '?';
			txt += (keys[i] + '=' + values[i]);
		}
	}
}

function isPdf(fileExt) {
	return fileExt.toLowerCase() === 'pdf';
}

function isJpg(fileExt) {
	return fileExt.toLowerCase() === 'jpg' || fileExt.toLowerCase() === 'jpeg';
}

function addJpgToViewport(divId, fileUrl) {
	var parent = $("#" + divId)[0];
	var line = document.createElement("div");
	line.setAttribute('id', 'documentviewer');
	line.setAttribute('fileurl', unescape(fileUrl));
	line.setAttribute('fileext', 'jpg');
	parent.appendChild(line);

	var img = document.createElement("img");
	img.setAttribute('src', unescape(fileUrl));
	img.onload = function() {
		new viewer({
			image : this
		});
		resizeJpg();
	};
	line.appendChild(img);
}

function changeFolderHighlight(folderId) {
	$(".folderlink").removeClass('selectedfolder');
	if (folderId != -1) {
		$('[folderid=' + folderId + ']').addClass('selectedfolder');
	}
	changeFileHighlight(-1);
}

function changeFileHighlight(folderId) {
	$(".filelink").removeClass('selectedfile');
	if (folderId != -1) {
		$('[fileid=' + folderId + ']').addClass('selectedfile');
	}
}

function populateFilesAndFolders(folderContainerId, filesContainerId,
		thisFolderId, idsToRoot) {
	changeFolderHighlight(thisFolderId);
	setFilenameForDownload(0, 0);

	var url = '' + SERVICE_PREFIX + GET_TOP_FOLDERS + LOGIN + '/' + PASSWORD
			+ '/%20/%20/2/Publish';
	if (thisFolderId != -1) {
		url = '' + SERVICE_PREFIX + GET_CHILDREN + LOGIN + '/' + PASSWORD + '/'
				+ thisFolderId + EFILE_POSTFIX;
	}

	if (TESTING) {
		var txt = '[["573139","2013-Audit"],["573144","2014-Audit"],["573148","2014-Bookeeping"],["573170","2014-Dividends"],["573185","2014-Franchise Tax Board"],["573203","2014-IRS"],["573236","2014-Stock"],["573253","2014-Taxes"],["573218","2014-k1s"],["573151","2015-Bookeeping"],["573172","2015-Dividends"],["573187","2015-Franchise Tax Board"],["573205","2015-IRS"],["573240","2015-Stock"],["573255","2015-Taxes"],["573220","2015-k1s"],["573154","2016-Bookeeping"],["573174","2016-Dividends"],["573189","2016-Franchise Tax Board"],["573207","2016-IRS"],["573242","2016-Stock"],["573257","2016-Taxes"],["573222","2016-k1s"],["573157","2017-Bookeeping"],["573176","2017-Dividends"],["573191","2017-Franchise Tax Board"],["573209","2017-IRS"],["573244","2017-Stock"],["573259","2017-Taxes"],["573224","2017-k1s"],["573160","2018-Bookeeping"],["573178","2018-Dividends"],["573193","2018-Franchise Tax Board"],["573211","2018-IRS"],["573246","2018-Stock"],["573261","2018-Taxes"],["573226","2018-k1s"],["573163","2019-Bookeeping"],["573180","2019-Dividends"],["573196","2019-Franchise Tax Board"],["573213","2019-IRS"],["573248","2019-Stock"],["573263","2019-Taxes"],["573228","2019-k1s"],["573166","2020-Bookeeping"],["573182","2020-Dividends"],["573198","2020-Franchise Tax Board"],["573215","2020-IRS"],["573250","2020-Stock"],["573265","2020-Taxes"],["573230","2020-k1s"],["573200","Holiday-Publish"],["573232","Legal-Publish"],["573267","Trees-Publish"],["573269","Vacation-Publish"]]';
		if (thisFolderId != -1) {
			txt = '[{"treeId":573141,"objectId":67830,"objectType":"NRT165","name":"Credit Card Auth.pdf","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":574009,"objectId":67957,"objectType":"NRT165","name":"IMAG0076.jpg","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":574011,"objectId":67959,"objectType":"NRT165","name":"IMAG0076.jpg","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":574013,"objectId":67961,"objectType":"NRT165","name":"IMAG0076.jpg","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":574001,"objectId":67949,"objectType":"NRT165","name":"IMAG0077.jpg","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":574004,"objectId":67952,"objectType":"NRT165","name":"IMAG0077.jpg","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":574006,"objectId":67954,"objectType":"NRT165","name":"IMAG0077.jpg","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":574008,"objectId":67956,"objectType":"NRT165","name":"IMAG0077.jpg","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":574010,"objectId":67958,"objectType":"NRT165","name":"IMAG0077.jpg","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":574012,"objectId":67960,"objectType":"NRT165","name":"IMAG0077.jpg","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":574014,"objectId":67962,"objectType":"NRT165","name":"IMAG0077.jpg","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":573999,"objectId":67947,"objectType":"NRT165","name":"IMAG0095.jpg","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":574000,"objectId":67948,"objectType":"NRT165","name":"IMAG0100.jpg","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":573866,"objectId":67902,"objectType":"NRT165","name":"INSTRUCTORS.pdf","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":573867,"objectId":67903,"objectType":"NRT165","name":"INSTRUCTORS.pdf","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":573994,"objectId":67942,"objectType":"NRT165","name":"LoadingCircle_finalani.gif","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":573995,"objectId":67943,"objectType":"NRT165","name":"LoadingCircle_finalani.gif","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":574108,"objectId":67986,"objectType":"NRT165","name":"MorningAfterCare2013.pdf","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":573140,"objectId":67829,"objectType":"NRT165","name":"arch1.pdf","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":573981,"objectId":67938,"objectType":"NRT165","name":"cid_cff.pdf","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":573982,"objectId":67939,"objectType":"NRT165","name":"colorkeymask.pdf","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":573142,"objectId":67831,"objectType":"NRT165","name":"f1040.pdf","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":573939,"objectId":67919,"objectType":"NRT165","name":"issue2391-1.pdf","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":573940,"objectId":67920,"objectType":"NRT165","name":"issue2391-2.pdf","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":573941,"objectId":67921,"objectType":"NRT165","name":"issue2462.pdf","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":573942,"objectId":67922,"objectType":"NRT165","name":"issue2537r.pdf","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":573943,"objectId":67923,"objectType":"NRT165","name":"issue2761.pdf","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":573944,"objectId":67924,"objectType":"NRT165","name":"issue2833.pdf","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":573945,"objectId":67925,"objectType":"NRT165","name":"issue2931.pdf","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":573946,"objectId":67926,"objectType":"NRT165","name":"issue3458.pdf","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":573947,"objectId":67927,"objectType":"NRT165","name":"issue4246.pdf","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":573948,"objectId":67928,"objectType":"NRT165","name":"issue4630.pdf","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":573949,"objectId":67929,"objectType":"NRT165","name":"issue5010.pdf","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":573950,"objectId":67930,"objectType":"NRT165","name":"issue5039.pdf","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":573936,"objectId":67916,"objectType":"NRT165","name":"issue840.pdf","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":573937,"objectId":67917,"objectType":"NRT165","name":"issue918.pdf","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":573938,"objectId":67918,"objectType":"NRT165","name":"issue925.pdf","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":573865,"objectId":67901,"objectType":"NRT165","name":"photo_2014-09-24-11-39.png","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":573980,"objectId":67937,"objectType":"NRT165","name":"screen0.png","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""},{"treeId":573143,"objectId":67832,"objectType":"NRT165","name":"test.txt","parentTreeId":573139,"isEncrypted":false,"encryptMode":0,"scanCode":""}]';
		}

		processResults(folderContainerId, filesContainerId, thisFolderId,
				idsToRoot, txt);
	} else {
		var datapackage = {
			folderContainerId : folderContainerId,
			filesContainerId : filesContainerId,
			thisFolderId : thisFolderId,
			idsToRoot : idsToRoot
		};

		generalHttpRequest('GET', url, null, resultsHandlerGetFolderFiles,
				datapackage, resultsHandlerGetFolderFiles, logToConsole);

	}

}

function processResults(folderContainerId, filesContainerId, thisFolderId,
		idsToRoot, txt) {
	var folderContainer = $("#" + folderContainerId)[0];
	var fileContainer = $("#" + filesContainerId)[0];

	var uploadButton = $("#addfiles")[0];
	uploadButton.disabled = (thisFolderId == -1);

	removeAllChildren(fileContainer);
	remove('documentviewer');

	var folders = [];
	var files = [];

	if (txt != null) {
		if (thisFolderId == -1) {
			var jsonArray = JSON.parse(txt);
			var folderNames = getFolderNames(jsonArray);
			var folderIds = getFolderIds(jsonArray);
			for (var i = 0; i < folderNames.length; i++) {
				var folder = {
					name : folderNames[i],
					id : folderIds[i]
				};
				folders.push(folder);
			}
		} else {
			var jsonData = JSON.parse(txt);
			for (var i = 0; i < jsonData.length; i++) {
				var line = jsonData[i];
				var file = {
					name : line.name,
					id : line.objectId
				};
				files.push(file);
			}

		}
	}

	var idsForward = idsToRoot.slice();

	if (folders.length > 0 || files.length > 0) {
		var dropzone = $("#drop_zone")[0];

		if (thisFolderId == -1) {
			removeAllChildren(folderContainer);
			dropzone.removeClass('droptarget');
			for (var i = 0; i < folders.length; i++) {
				var line = document.createElement("li");
				line.addClass("folderlink");
				line.setAttribute('folderid', folders[i].id);
				line.innerHTML = ('<span class="k-sprite folder"></span>' + folders[i].name);
				line.setAttribute("onclick", 'populateFilesAndFolders(\''
						+ folderContainerId + '\', \'' + filesContainerId
						+ '\', ' + folders[i].id + ', ['
						+ idsForward.toString() + '])');
				line.style.textOverflow = "ellipsis";
				line.style.whiteSpace = "nowrap";
				line.style.overflow = "hidden";
				folderContainer.appendChild(line);
			}
		} else {
			fileContainer.setAttribute('current_fid', thisFolderId);
			dropzone.addClass('droptarget');
			for (var i = 0; i < files.length; i++) {
				var line = document.createElement("li");
				line.addClass("filelink");
				line.setAttribute('fileid', files[i].id);
				line.innerHTML = ('<span class="k-sprite file"></span>' + files[i].name);
				line.setAttribute("onclick",
						'injectIframeWithViewer(\'filecontent\', '
								+ files[i].id + ', \'' + files[i].name + '\')');
				line.style.textOverflow = "ellipsis";
				line.style.whiteSpace = "nowrap";
				line.style.overflow = "hidden";
				fileContainer.appendChild(line);
			}
			movePanels(true);
		}
		dropzone.removeClass('k-scrollable');

	} else {

		displayError('No Files or Folders', 'filecontent');
	}
}

function movePanels(moveForward, goAllBack) {
	if (SCREEN_TYPE == 'BOTH')
		return;
	var panels = $(".movingpanel");

	var index = 0;

	if (!goAllBack) {
		for (var i = 0; i < panels.length; i++) {
			if (panels[i].style.display != 'none') {
				index = i;
				break;
			}
		}

		if (moveForward) {
			index++;
		} else {
			index--;
		}
	}

	if (index < 0)
		index = panels.length - 1;
	else if (index >= panels.length)
		index = 0;
	for (var i = 0; i < panels.length; i++) {
		if (index == i) {
			panels[i].style.display = 'block';
		} else {
			panels[i].style.display = 'none';
		}
	}

	if (index == 0) {
		$('.backarrow').hide();
	} else {
		$('.backarrow').show();
	}

}

function deleteFileOnServer(fileUrl) {
	if (!fileUrl)
		return;
	var filename = fileUrl.split('/').pop();
	if (!filename)
		return;
	var datapackage = {
		fileUrl : fileUrl
	};
	var url = DELETE_URL + filename;

	generalHttpRequest('GET', url, null, resultsHandlerDeleteFile, datapackage,
			null, logToConsole);
}

function displayError(message, divId) {

	var divParent = document.getElementById(divId);
	if (divParent && message) {
		var line = document.createElement("div");
		line.setAttribute('id', 'documentviewer');
		line.innerHTML = ('<span class="error_message">' + message + '</span>');
		divParent.appendChild(line);
	}
}

function removeAllChildren(myNode) {
	if (!myNode)
		return;
	var len = myNode.childNodes.length;
	while (myNode.hasChildNodes()) {
		myNode.removeChild(myNode.firstChild);
	}
}

function getFolderIds(twoDimArray) {
	var results = [];
	if (twoDimArray && twoDimArray.length > 0) {
		for (var i = 0; i < twoDimArray.length; i++) {
			results.push(twoDimArray[i][0]);
		}
	}
	return results;
}

function getFolderNames(twoDimArray) {
	var results = [];
	if (twoDimArray && twoDimArray.length > 0) {

		for (var i = 0; i < twoDimArray.length; i++) {
			var array1 = twoDimArray[i];
			var name = array1[1];
			results.push(name);
		}

	}
	return results.sort();
}

function findShortestArray(twoDimArray) {
	var min = -1;
	if (twoDimArray) {
		for (var j = 0; j < twoDimArray.length; j++) {
			if (min == -1) {
				min = twoDimArray[j].length;
			} else if (twoDimArray[j].length < min) {
				min = twoDimArray[j].length;
			}
		}
	}

	return min;
}

function getIthFieldFromEnd(twoDimArray, i)// i will not be bigger than
// shortest array
{
	var results = [];
	if (twoDimArray && twoDimArray.length > 0 && i >= 0) {
		for (var j = 0; j < twoDimArray.length; j++) {
			var thisArray = twoDimArray[j];
			var thisLen = thisArray.length;
			if (thisLen > i) {
				results.push(thisArray[thisLen - 1 - i]);
			}
		}
	}

	results = removeDuplicates(results);

	return results;
}

function getIthFieldFromAll(twoDimArray, i)// and remove duplicates
{
	var results = [];
	if (twoDimArray && twoDimArray.length > 0 && i >= 0) {
		for (var j = 0; j < twoDimArray.length; j++) {
			var thisArray = twoDimArray[j];
			if (thisArray.length > i) {
				results.push(thisArray[i]);
			}
		}
	}

	results = removeDuplicates(results);

	return results;
}

function removeDuplicates(inArray) {
	uniqueArray = inArray.filter(function(item, pos) {
		return inArray.indexOf(item) == pos;
	});
	return uniqueArray;
}

// //from http://www.html5rocks.com/en/tutorials/cors/
// //Create the XHR object.
// function createCORSRequest(method, url) {
// var xhr;
// var browser = navigator.appName;
// if (browser == "Microsoft Internet Explorer") {
// //xhr = new ActiveXObject("Microsoft.XMLHTTP");
// xhr = new XDomainRequest();
// xhr.open(method, url);
// } else {
// xhr = new XMLHttpRequest();
// xhr.open(method, url, true);
// }
// //if ("withCredentials" in xhr) {
// //// XHR for Chrome/Firefox/Opera/Safari.
// //xhr.open(method, url, true);
// //} else if (typeof XDomainRequest != "undefined") {
// //// XDomainRequest for IE.
// //// xhr = new XDomainRequest();
// //xhr.open(method, url);
// //} else {
// //// CORS not supported.
// //xhr = null;
// //}
// return xhr;
// }

function resultsHandlerGetUploadId(text, datapackage) {
	var file = datapackage.file;
	var filename = file.name;
	var jsonData = JSON.parse(text);
	var objectid = jsonData[0].objectId;
	if (objectid) {
		logToConsole('received file id = ' + objectid);
		var url1 = UPLOAD_FILE_URL + LOGIN + '/' + PASSWORD + '/' + objectid
				+ '/' + OBJECTTYPE + '/' + PASSWORD + '/1';
		logToConsole('uploading ' + filename + ' with id = ' + objectid
				+ ' to ' + url1);

		var formData = new FormData();
		formData.append(filename, file, filename);

		generalHttpRequest('POST', url1, formData, resultsHandlerUploadFile,
				datapackage, null, logToConsole);
	}
}

function resultsHandlerUploadFile(text, datapackage) {
	var file = datapackage.file;
	var directoryId = datapackage.directoryId;

	if (text && text === UPLOAD_SUCCESS_TEXT) {
		// alert(file.name + ' uploaded successfully');
		populateFilesAndFolders('folder_container', 'file_container',
				directoryId, []);
	}
	DOCUMENT_COUNTER++;
	if (DOCUMENT_COUNTER == datapackage.numFiles) {
		hideSpinner();
		alert('done uploading ' + datapackage.numFiles + ' files');
	}
}

function resultsHandlerDeleteFile(text, datapackage) {
	if (text && text == 'true') {
		logToConsole('deleted file on server at ' + datapackage.fileUrl);
	}

}

var DOCUMENT_COUNTER = 0; // dont like global var. need a better solution

function uploadFile(files) {
	var fileContainer = $("#file_container")[0];
	if (!fileContainer || !files)
		return;
	var directoryId = fileContainer.getAttribute('current_fid');
	if (!directoryId)
		return;

	showSpinner();
	// if (files.length > 1) {
	// alert('still testing with multiple files');
	// }

	DOCUMENT_COUNTER = 0;
	for (i = 0; i < files.length; i++) {
		var file = files[i];
		var filename = file.name;
		if (filename) {
			var url0 = GET_FILE_ID_URL + LOGIN + '/' + PASSWORD + '/'
					+ directoryId + '/eFile/' + filename;
			logToConsole('getting file id from ' + url0);
			var datapackage = {
				file : file,
				directoryId : directoryId,
				numFiles : files.length
			};

			generalHttpRequest('GET', url0, null, resultsHandlerGetUploadId,
					datapackage, null, logToConsole);

		}
	} // end of for loop

}

function printDocument() {
	var element = document.getElementById('documentviewer');
	var fileExt = element.getAttribute('fileext');
	var elem2 = $('.page-image');

	if (isPdf(fileExt) && element.contentWindow) {
		element.contentWindow.print();
	} else if (isJpg(fileExt)) {
		var image = $(element).find('img');
		var src = $(image).attr('src');
		openWinAndPrint(src);
	} else {
		var fileUrl = element.getAttribute('fileUrl');
		alert('If the print dialog is empty please hit cancel on the print dialog and then try crtl-P to print this document.');
		openWinAndPrint(fileUrl);
		// var iframe = document.frames ? document.frames[id] :
		// document.getElementById('documentviewer');
		// var ifWin = iframe.contentWindow || iframe;
		// iframe.focus();
		// ifWin.print();
	}
}

function openWinAndPrint(src) {
	console.log('opening window to print ' + src);
	var myWindow = window.open('', '');
	// myWindow.document.write("<body onload=\"window.print()\"
	// onfocus=\"window.close()\"><p><img src='" + src + "'/></p></body>");
	myWindow.document
			.write("<body onload=\"window.print(); window.close();\" ><p><img src='"
					+ src + "'/></p></body>");
	// myWindow.document.write("<body ><p><img src='" + src + "'/></p></body>");

	myWindow.document.close();
	myWindow.focus();
	// myWindow.print();
	// myWindow.close();
	// setTimeout(myWindow.close(), 500);
	// myWindow.onfocus=function(){ myWindow.close();}

}

function logToConsole(text) {
	if (DEBUG) {
		console.log(text);
	}
}

function addDragDropListener() {
	function handleFileSelect(evt) {
		evt.stopPropagation();
		evt.preventDefault();

		var files = evt.dataTransfer.files; // FileList object.

		if (!files)
			return;
		unhighlightForDrag(1);
		console.log('dragdrop on ' + files.length + ' files');
		uploadFile(files);
	}

	function handleDragOver(evt) {
		evt.stopPropagation();
		evt.preventDefault();
		evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a
		// copy

	}

	// Setup the dnd listeners.
	var dropZone = document.getElementById('drop_zone');
	dropZone.addEventListener('dragover', handleDragOver, false);
	dropZone.addEventListener('drop', handleFileSelect, false);
}

function showSpinner() {
	var ldiv = document.getElementById('LoadingDiv');
	ldiv.style.display = 'block';
}

function hideSpinner() {
	// alert('hiding');
	var ldiv = document.getElementById('LoadingDiv');
	ldiv.style.display = 'none';
}

function setUsernamePassword(u, p) {
	LOGIN = u;
	PASSWORD = p;
}

var DRAGCOUNTER = 0;

function unhighlightForDrag(force) {
	DRAGCOUNTER--;
	if (force || DRAGCOUNTER == 0) {
		var object = $('#drop_zone');
		object.removeClass('draghighlight');
		DRAGCOUNTER = 0;
	}
}

function highlightForDrag() {
	var object = $('#drop_zone');
	object.addClass('draghighlight');

}

var SPLITTER_ELEM = 0;
function addSplitter() {

	$("#vertical").kendoSplitter({
		orientation : "vertical",
		panes : [ {
			collapsible : false
		}, {
			collapsible : false,
			resizable : false,
			size : "10%"
		} ]
	});

	var splitterElement = $(".horizontal").kendoSplitter({
		panes : [ {
			collapsible : true,
			scrollable : false,
			size : "220px"
		}, {
			collapsible : false
		} ]
	});
	SPLITTER_ELEM = splitterElement;

	$('#bottom-pane').kendoSplitter({
		orientation : "vertical",
		panes : [ {
			collapsible : true,
			scrollable : false,
			size : "8%"
		}, {
			collapsible : false,
			scrollable : false
		}, {
			collapsible : false,
			resizable : false,
			size : "10%"
		} ]
	});

}

function addActions() {
	if (SCREEN_TYPE == 'BOTH') {
		addDragDropListener();
		$(document).on('dragenter', function() {
			DRAGCOUNTER++;

		});

		$(document).on('dragleave', function() {
			setTimeout(unhighlightForDrag(), 100);

		});
	}

	// hide/show folder pane
	$('#toggleaction').click(function(e) {
		if (SPLITTER_ELEM) {
			var leftPane = $("#folder-block");
			var isShowingNow = leftPane.width() > 0;
			var splitter = SPLITTER_ELEM.data("kendoSplitter");
			var innerAnchor = $(this).find('a:first');
			innerAnchor.text((isShowingNow) ? "Show" : "Hide");
			splitter[isShowingNow ? "collapse" : "expand"](leftPane);
			resizeContent();
		}

	});

	// add/upload files
	document.getElementById('addfiles').addEventListener('change', function(e) {
		uploadFile(this.files);
	}, false);

	$('#uploadaction').click(function(e) {
		$("#addfiles").trigger('click');
	});

	// print file
	$('#printaction').click(function(e) {
		printDocument();
	});

	$('.backarrow').hide();

	$('#backarrow0').click(function(e) {
		movePanels(false, 1);
	});

	$('#backarrow1').click(function(e) {
		movePanels(false);
	});
}
