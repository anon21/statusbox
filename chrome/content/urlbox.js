
var urlbox = function() {
	const Cc = Components.classes;
	const Ci = Components.interfaces;
	
	var pref_ = Cc["@mozilla.org/preferences-service;1"]
		.getService(Ci.nsIPrefService)
		.getBranch("extensions.urlbox.");
	
	var app_ = Cc["@mozilla.org/fuel/application;1"]
		.getService(Ci.fuelIApplication);
	
	var shouldUpdate_  = true;
	var showInUrlbar_ = false;
	
	var urlboxButton_ = null;
	var urlboxLabel_ = null;
	
	var nativeSetOverLink = XULBrowserWindow.setOverLink;
	
	// リンクをマウスオーバーしたときに呼び出されるメソッド
	function overlaySetOverLink(url, anchorElt) {
		if( shouldUpdate_ ) {
			updateUrlboxButton();
			
			XULBrowserWindow.setOverLink(url, anchorElt);
		} else {
			urlboxLabel_.value = url;
			
			if( showInUrlbar_ ) {
				nativeSetOverLink(url, anchorElt);
			}
		}
	}
	
	// preferenceに設定された値を適用する
	function applyPref() {
		if( pref_.getBoolPref("flex") ) {
			urlboxButton_.flex = "1";
		} else {
			urlboxButton_.flex = "0";
			urlboxButton_.width = pref_.getIntPref("width");
		}
		
		switch( pref_.getIntPref("textAlign") ) {
		case 0:
			urlboxLabel_.style.textAlign = "left";
			break;
		case 1:
			urlboxLabel_.style.textAlign = "center";
			break;
		case 2:
			urlboxLabel_.style.textAlign = "right";
			break;
		}
		
		showInUrlbar_ = pref_.getBoolPref("showInUrlbar");
	}
	
	// URL Boxボタンの状態を更新する
	function updateUrlboxButton() {
		var urlboxButton = document.getElementById("urlbox-button");
		
		if( urlboxButton ) {
			urlboxButton_ = urlboxButton;
			urlboxLabel_ = document.getElementById("urlbox-label");
			
			applyPref();
			
			XULBrowserWindow.setOverLink = overlaySetOverLink;
		} else {
			XULBrowserWindow.setOverLink = nativeSetOverLink;
			
			urlboxButton_ = null;
			urlboxLabel_ = null;
		}
		
		shouldUpdate_ = false;
	}
	
	// URL Boxボタンがドラッグされたら，次回使用時に状態更新を要求する
	function onUrlboxButtonDragStart(evt) {
		shouldUpdate_ = true;
	}
	
	// URL Boxボタンがツールバー上にドロップされたら，ただちに更新する
	function onUrlboxButtonDragDrop(evt) {
		updateUrlboxButton();
	}
	
	// preferenceの変更監視用オブジェクト
	var prefObserver_ = {
		observe: function(aSubject, aTopic, aData) {
			if( aTopic == "nsPref:changed" ) {
				if( urlboxButton_ ) {
					applyPref();
				}
			}
		},
	};
	
	return {
		onLoad: function() {
			updateUrlboxButton();
			
			// ツールバーボタンのカスタマイズを監視
			document.getElementById("navigator-toolbox")
				.addEventListener('dragstart', onUrlboxButtonDragStart, false);
			
			document.getElementById("navigator-toolbox")
				.addEventListener('dragdrop', onUrlboxButtonDragDrop, false);
			
			document.getElementById("addon-bar")
				.addEventListener('dragstart', onUrlboxButtonDragStart, false);
			
			document.getElementById("addon-bar")
				.addEventListener('dragdrop', onUrlboxButtonDragDrop, false);
			
			// preferenceの変更を監視
			pref_.QueryInterface(Ci.nsIPrefBranch2);
			pref_.addObserver("", prefObserver_, false);
			pref_.QueryInterface(Ci.nsIPrefBranch);
		},
		
		onUnload: function() {
			// ツールバーボタンのカスタマイズの監視を解除
			document.getElementById("navigator-toolbox")
				.removeEventListener('dragstart', disableUrlboxButton, false);
			
			document.getElementById("navigator-toolbox")
				.removeEventListener('dragdrop', disableUrlboxButton, false);
			
			document.getElementById("addon-bar")
				.removeEventListener('dragstart', disableUrlboxButton, false);
			
			document.getElementById("addon-bar")
				.removeEventListener('dragdrop', disableUrlboxButton, false);
			
			// preferenceの変更の監視を解除
			pref_.QueryInterface(Ci.nsIPrefBranch2);
			pref_.removeObserver("", prefObserver_);
			pref_.QueryInterface(Ci.nsIPrefBranch);
		},
	};
}();

window.addEventListener("load", urlbox.onLoad, false);
window.addEventListener("unload", urlbox.onUnload, false);
