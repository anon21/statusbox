
var urlbox = function() {
	const Cc = Components.classes;
	const Ci = Components.interfaces;
	
	var pref_ = Cc["@mozilla.org/preferences-service;1"]
		.getService(Ci.nsIPrefService)
		.getBranch("extensions.urlbox.");
	
	var showInUrlbar_;
	
	var urlboxButton_ = null;
	var urlboxLabel_ = null;
	
	var nativeSetOverLink = XULBrowserWindow.setOverLink;
	
	// リンクをマウスオーバーしたときに呼び出されるメソッド
	function overlaySetOverLink(link, elem) {
		urlboxLabel_.value = link;
		
		if( showInUrlbar_ ) {
			nativeSetOverLink(link, elem);
		}
	}
	
	// preferenceに設定された値を適用する
	function applyPref() {
		if( pref_.getBoolPref("flex") ) {
			urlboxLabel_.flex = "1";
		} else {
			urlboxLabel_.flex = "0";
			
			urlboxLabel_.width = pref_.getIntPref("width");
			
			switch( pref_.getIntPref("position") ) {
			case 0:
				urlboxButton_.pack = "start";
				break;
			case 1:
				urlboxButton_.pack = "center";
				break;
			case 2:
				urlboxButton_.pack = "end";
				break;
			}
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
	
	// ツールバーボタンの状態が変更されたとき(および初期化時)呼び出されるメソッド
	function update() {
		var urlboxButton = document.getElementById("urlbox-button");
		
		if( urlboxButton ) {
			if( !urlboxButton_ ) {
				urlboxButton_ = urlboxButton;
				urlboxLabel_ = document.getElementById("urlbox-label");
				
				applyPref();
				
				XULBrowserWindow.setOverLink = overlaySetOverLink;
			}
		} else {
			if( urlboxButton_ ) {
				urlboxButton_ = null;
				urlboxLabel_ = null;
				
				XULBrowserWindow.setOverLink = nativeSetOverLink;
			}
		}
	}
	
	// preferenceの監視用オブザーバオブジェクト
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
			update();
			
			// ツールバーボタンのカスタマイズを監視
			document.getElementById("navigator-toolbox")
				.addEventListener('dragdrop', update, false);
			
			document.getElementById("addon-bar")
				.addEventListener('dragdrop', update, false);
			
			// preferenceの変更を監視
			pref_.QueryInterface(Ci.nsIPrefBranch2);
			pref_.addObserver("", prefObserver_, false);
			pref_.QueryInterface(Ci.nsIPrefBranch);
		},
		
		onUnload: function() {
			// ツールバーボタンのカスタマイズの監視を解除
			document.getElementById("navigator-toolbox")
				.removeEventListener('dragdrop', updateObserver, false);
			
			document.getElementById("addon-bar")
				.removeEventListener('dragdrop', updateObserver, false);
			
			// preferenceの変更の監視を解除
			pref_.QueryInterface(Ci.nsIPrefBranch2);
			pref_.removeObserver("", prefObserver_);
			pref_.QueryInterface(Ci.nsIPrefBranch);
		},
	};
}();

window.addEventListener("load", urlbox.onLoad, false);
window.addEventListener("unload", urlbox.onUnload, false);
