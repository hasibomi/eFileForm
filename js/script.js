$(document).ready(
		function() {

			//var treeview = $('.treeview').kendoTreeView();
			(function($) {
				jQuery.expr[':'].Contains = function(a, i, m) {
					return (a.textContent || a.innerText || "").toUpperCase()
							.indexOf(m[3].toUpperCase()) >= 0;
				};

				function live_search(list) {
					$("#search-folder").change(
							function() {
								var searchtext = $(this).val();
								if (searchtext) {
									$matches = $(list).find(
											'li:Contains(' + searchtext + ')');
									$('li', list).not($matches).slideUp();
									$matches.slideDown();

								} else {
									$(list).find("li").slideDown(200);
								}
								return false;
							}).keyup(function() {
						$(this).change();
					});
				}

				$(function() {
					live_search($("#folder_container"));
				});
			}(jQuery));
			(function($) {
				jQuery.expr[':'].Contains = function(a, i, m) {
					return (a.textContent || a.innerText || "").toUpperCase()
							.indexOf(m[3].toUpperCase()) >= 0;
				};

				function live_search(list) {
					$("#search-file").change(
							function() {
								var searchtext = $(this).val();
								if (searchtext) {
									$matches = $(list).find(
											'li:Contains(' + searchtext + ')');
									$('li', list).not($matches).slideUp();
									$matches.slideDown();

								} else {
									$(list).find("li").slideDown(200);
								}
								return false;
							}).keyup(function() {
						$(this).change();
					});
				}

				$(function() {
					live_search($("#file_container"));
				});
			}(jQuery));


		});
