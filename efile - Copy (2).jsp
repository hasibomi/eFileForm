<%-- efile.jsp

Description: web portal circa 2014.

=============================================================
Date      Name      Modifications
=============================================================
2014-08-08 Jiang - creation
=============================================================


--%>
<!-- set the jsp import statments -->
<%@ page    language="java"
						errorPage="jsp/checklogin_errorpage.jsp"
						import="com.rco.jsp.*,
								java.util.ArrayList,
								java.util.Vector,
								com.rco.client.*,
								com.rco.utility.CUtil,
								com.rco.utility.RightType,
								com.rco.utility.CEncode,
								com.rco.CORBABase.*"
%>

<%-- Conditionally Instantiate the client beans --%>
<jsp:useBean id="clientBean" class="com.rco.jsp.CClientBean" scope="session"/>
<jsp:useBean id="passwordBean" class="com.rco.jsp.CPasswordBean" scope="page"/>
<jsp:useBean id="userLoginBean" class="com.rco.jsp.CUserLoginBean" scope="page"/>
<jsp:useBean id="monitor" class="java.util.HashMap" scope="application"/>
<jsp:useBean id="generalObjectTypeBean" class="com.rco.jsp.CGeneralObjectTypeBean" scope="page"/>
<jsp:useBean id="roleList" class="com.rco.jsp.CRoleListBean" scope="session"/>
<jsp:useBean id="userRights" class="com.rco.jsp.CRightsBean" scope="session"/>


<%
	User user = (User)session.getValue("user");
	String strThis = "[efile.jsp] user: " + user.getLabel() + ", ";

	generalObjectTypeBean.setUser(user);


	boolean bFilesMenu =   userRights.isRightAvailable(RightType.PORTAL_DISPLAY_FILE_MENU );
	boolean bFormsMenu =  userRights.isRightAvailable(RightType.PORTAL_DISPLAY_FORMS_MENU );
	boolean bReportMenu =   userRights.isRightAvailable(RightType.PORTAL_DISPLAY_REPORTS_MENU );
	boolean bTimecardMenu =  userRights.isRightAvailable(RightType.PORTAL_DISPLAY_TIMECARD_MENU );


%>




<!DOCTYPE html PUBLIC "-//W3C//DTD html 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>eFiles Viewer</title>

<link href="css/kendo.common.min.css" rel="stylesheet">
<!-- <link href="http://cdn.kendostatic.com/2014.2.903/styles/kendo.rtl.min.css" rel="stylesheet">
		<link href="http://cdn.kendostatic.com/2014.2.903/styles/kendo.black.min.css" rel="stylesheet">
		<link href="http://cdn.kendostatic.com/2014.2.903/styles/kendo.black.mobile.min.css" rel="stylesheet">
		<link href="http://cdn.kendostatic.com/2014.2.903/styles/kendo.dataviz.min.css" rel="stylesheet">
		<link href="http://cdn.kendostatic.com/2014.2.903/styles/kendo.dataviz.black.min.css" rel="stylesheet"> -->

<link rel="stylesheet" type="text/css" href="css/kendo.common.min.css" />
<link rel="stylesheet" type="text/css" href="css/kendo.blueopal.min.css" />
<link rel="stylesheet" type="text/css" href="css/styles.css" />
<link rel="stylesheet" type="text/css" href="css/bootstrap.min.css" />
<link rel="stylesheet" type="text/css" href="css/menu_styles.css" />

<link rel="stylesheet" media="(max-width: 768px)"
	href="css/single_display.css" />
<link rel="stylesheet" media="(min-width: 768px)"
	href="css/all_display.css" />



<script src="https://code.jquery.com/jquery-1.9.0.js"></script>
<!-- 1.9.0 -->
<script type="text/javascript" src="js/jquery-1.11.js"></script>
<script type="text/javascript" src="js/bootstrap.min.js"></script>

<script type="text/javascript" src="js/kendo.all.min.js"></script>
<script type="text/javascript" src="js/script.js"></script>
<script type="text/javascript" src="js/mootools-yui-compressed.js"></script>

<script type="text/javascript"
	src="simplejavascriptimageviewer/script/core/Simple_Viewer_beta_1.1.js"></script>


<script type="text/javascript" src="js/webservice.js"></script>
<script type="text/javascript" src="js/efile.js"></script>
<script>
	$(document)
			.ready(
					function() {
						var TESTING = window.location.hostname.indexOf('rco') < 0;
						var mode = 'unknown';
						var MIN_WIDTH_FOR_BOTH = 768; // may later make this more dynamic

						if (window.matchMedia("(orientation: portrait)").matches) {
							mode = 'portrait';
						}

						if (window.matchMedia("(orientation: landscape)").matches) {
							mode = 'landscape';
						}

						if ((screen.width >= MIN_WIDTH_FOR_BOTH)) {
							addSplitter();
							logToConsole(screen.width + ' ' + screen.height
									+ ' ' + mode + ' BIG');
							//$("link[rel=stylesheet]:not(:first)").attr({href : "detect1024.css"});
						} else {
							logToConsole(screen.width + ' ' + screen.height
									+ ' ' + mode + ' LITTLE');
							//$("link[rel=stylesheet]:not(:first)").attr({href : "detect800.css"});
							SCREEN_TYPE = 'SINGLE';
						}

						var proceed = !AUTH_REQUIRED;
						/*
						if (AUTH_REQUIRED && sessionStorage.isLoggedIn) {
							setUsernamePassword(sessionStorage.username,
									sessionStorage.password);
							logToConsole('user is logged in as '
									+ sessionStorage.username);
							proceed = true;
						}
						 */
						proceed = true;
						if (!proceed) {
							if (sessionStorage.loginPage) {
								window.location.href = session.loginPage;
							} else {
								window.location.href = "login.html";
								/* 	displayError(
											'User is not logged in. \n Go to login.html to login.',
											'filecontent'); */
							}
						} else {
							//populate left side
							populateFilesAndFolders('folder_container',
									'file_container', -1, []);

							// for testing
							if (TESTING) {
								//injectIframeWithViewer('filecontent', null, '../../rocky.pdf');
								injectIframeWithViewer('filecontent', null,
										'IMAG0295.jpg');
								//injectIframeWithViewer('filecontent', null, 'eFileForm/bell.png');
							}

							if (window.File && window.FileReader
									&& window.FileList && window.Blob) {
								// Great success! All the File APIs are supported.
							} else {
								console
										.log('The File APIs are not fully supported in this browser.');
							}

						}

						addActions();
						/* 						$("a[href^=#]").on("click", function(e) {
						 e.preventDefault();
						 history.pushState({}, "", this.href);
						 });
						 */

					});
</script>

</head>

<body onresize="resizeContent()">

	<nav class="navbar navbar-default navbar-fixed-top" role="navigation">
		<div class="container-fluid">
			<div class="navbar-header">
				<div class="container">
					<button type="button" class="navbar-toggle collapsed pull-left"
						data-toggle="collapse" data-target="#collapsible_area">
						<span class="sr-only">Toggle navigation</span> <span
							class="icon-bar"></span> <span class="icon-bar"></span> <span
							class="icon-bar"></span>
					</button>

					<input id='backarrow0' class='backarrow' type="image" id="myimage"
						src="images/LeftArrows.png" style="height: 32px; width: 32px; margin: 2px;  position:absolute; right:40px; " />
					<input
						id='backarrow1' class='backarrow' type="image" id="myimage"
						src="images/LeftArrow.png" style="height: 32px; width: 32px; margin: 2px; position:absolute; right:0px; " />

				</div>
			</div>
			<!-- end .navbar-header -->
			<div class="collapse navbar-collapse" id="collapsible_area">
				<ul class="nav navbar-nav">
	<%
				if (bFilesMenu) {
	%>
					<li class="dropdown"><a href="#" class="dropdown-toggle"
						data-toggle="dropdown">Files <span class="caret"></span></a>

						<ul class="dropdown-menu" role="menu">
							<li id='toggleaction'><a href="#">Hide</a></li>
							<li id='uploadaction'><a href="#">Upload</a></li>
							<input type="file" disabled name="addfiles" id="addfiles"
								style="display: none" multiple />
							<li id='saveaction'><a id='downloadanchor' href="#" download>Save</a></li>
							<li id='printaction'><a href="#">Print</a></li>
						</ul></li>
	<%          }
	            if (bFormsMenu) {
	%>
					<li><a href="#">Forms</a></li>
	<%          }
	            if (bReportMenu) {
	%>
					<li><a href="#">Report</a></li>
	<%          }
	            if (bTimecardMenu) {
	%>
					<li class="dropdown"><a href="#" class="dropdown-toggle"
						data-toggle="dropdown">Timecard <span class="caret"></span></a>

						<ul class="dropdown-menu" role="menu">
							<li><a href="#">Submit Timecard</a></li>
							<li><a
								href="https://www.rcofox.com/Image2000/i2k/Forms/timecards/index.html">New
									Timecard</a></li>
							<li><a href="#">Add Timecard</a></li>
							<li><a href="#">Add Detail</a></li>
							<li><a href="#">Delete Detail</a></li>
							<li><a href="#">Clone Detail</a></li>
						</ul></li>
	<%          }
	%>
				</ul>
				<!-- /ul.nav.navbar-nav -->

			</div>
			<!-- /#collapsible_area.collapse.navbar-collapse -->


		</div>
		<!-- /.container -->
	</nav>
	<!-- /nav.navbar -->


	<!-- <div id='overlay' style="width: 100%; height: 100%; display: none;" ondragleave="unhighlightForDrag()"></div> -->
	<div id="vertical" style="height: 100%">
		<div id="horizontalparent" ondragenter="highlightForDrag()"
			style="height: 100%">
			<div class="horizontal" style="height: 100%; width: 100%;">
				<div id="folder-block" style="height: 100%">
					<div id="top-pane" class="movingpanel">
						<p class="search" id="top-search"
							style="width: 100%; min-height: 8%;">

							<input type="search" name="search-folder" class="search-box"
								id="search-folder" placeholder="Search for folders" />
						</p>
						<ul class="treeview" id="folder_container">
						</ul>
					</div>
					<div id="bottom-pane" class="movingpanel">
						<div id="drop_zone" style="height: 100%">
							<p class="search" id="bottom-search"
								style="width: 100%; min-height: 8%;">
								<input type="text" name="search-file" class="search-box"
									id="search-file" placeholder="Search for files" />
							</p>

							<ul class="treeview" id="file_container">
							</ul>
						</div>
					</div>
				</div>

				<div id="filecontent" class="movingpanel" style="margin-bottom: 50%;">
					<div id="LoadingDiv" style="display: none;">
						<img src="images/ajax-loader.gif" alt="" />
					</div>
				</div>
			</div>
		</div>
	</div>

</body>
</html>