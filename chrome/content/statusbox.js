
var statusBox = function() {
	const Cc = Components.classes;
	const Ci = Components.interfaces;
	
	var pref_ = Cc["@mozilla.org/preferences-service;1"]
		.getService(Ci.nsIPrefService)
		.getBranch("extensions.statusbox.");
	
	var nativeField_ = document.getElementById("statusbar-display");
	var overlayField_ = null;
	
	// preferenceに設定された値を適用する
	function applyPreference() {
		if( overlayField_ ) {
			let button = document.getElementById("statusbox-button");
			
			if( pref_.getBoolPref("flex") ) {
				button.flex = "1";
			} else {
				button.flex = "0";
				button.width = pref_.getIntPref("width");
			}
			
			switch( pref_.getIntPref("textAlign") ) {
			case 0:
				overlayField_.style.textAlign = "left";
				break;
			case 1:
				overlayField_.style.textAlign = "center";
				break;
			case 2:
				overlayField_.style.textAlign = "right";
				break;
			}
			
			let addonbarCloseButton = document.getElementById("addonbar-closebutton");
			
			if( pref_.getBoolPref("hideAddonbarCloseButton") ) {
				addonbarCloseButton.style.display = "none";
			} else {
				addonbarCloseButton.style.display = "";
			}
		}
	}
	
	// preferenceの変更監視用オブジェクト
	var prefObserver_ = {
		observe: function(aSubject, aTopic, aData) {
			if( aTopic == "nsPref:changed" ) {
				applyPreference();
			}
		},
	};
	
	// UIの状態を更新する
	function updateUIStatus() {
		overlayField_ = document.getElementById("statusbox-field");
		
		if( overlayField_ ) {
			delete overlayField_.label;
			overlayField_.__defineSetter__("label", function(x) {
				this.value = x;
			});
			
			applyPreference();
		}
	}
	
	// ツールバーのカスタマイズの監視イベントリスナ
	function customizeChange(e) {
		updateUIStatus();
	}
	
	return {
		onLoad: function() {
			updateUIStatus();
			
			// Getterを上書き
			delete XULBrowserWindow.statusTextField;
			XULBrowserWindow.__defineGetter__("statusTextField", function() {
				return ( overlayField_ && overlayField_.boxObject.height != 0 ) ?
					overlayField_ : nativeField_;
			});
			
			// ツールバーのカスタマイズの監視
			window.addEventListener("customizationchange", customizeChange, false);
			
			// preferenceの変更の監視
			pref_.QueryInterface(Ci.nsIPrefBranch2);
			pref_.addObserver("", prefObserver_, false);
			pref_.QueryInterface(Ci.nsIPrefBranch);
		},
		
		onUnload: function() {
			// ツールバーのカスタマイズの監視の解除
			window.removeEventListener("customizationchange", customizeChange, false);
			
			// preferenceの変更の監視を解除
			pref_.QueryInterface(Ci.nsIPrefBranch2);
			pref_.removeObserver("", prefObserver_);
			pref_.QueryInterface(Ci.nsIPrefBranch);
		},
	};
}();

window.addEventListener("load", statusBox.onLoad, false);
window.addEventListener("unload", statusBox.onUnload, false);
