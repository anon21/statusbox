
var statusBoxOptions = function() {
	return {
		updateFlexGroup: function() {
			var elems = document.getElementsByClassName("statusbox-flex-group");
			var b = document.getElementById("statusbox-flex-checkbox").checked;
			
			for(var i = 0; i < elems.length; ++i) {
				elems[i].disabled = b;
			}
		},
	};
}();

window.addEventListener("load", statusBoxOptions.updateFlexGroup, false);
