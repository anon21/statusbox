
var urlboxOptions = function() {
	return {
		onFlexChange: function() {
			var elems = document.getElementsByClassName("urlbox-flex-group");
			var b = document.getElementById("urlbox-flex-checkbox").checked;
			
			for(var i = 0; i < elems.length; ++i) {
				elems[i].disabled = b;
			}
		},
	};
}();

window.addEventListener("load", urlboxOptions.onFlexChange, false);
