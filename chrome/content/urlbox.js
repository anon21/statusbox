
var urlbox = function() {
	const Cc = Components.classes;
	const Ci = Components.interfaces;
	
	var pref_ = Cc["@mozilla.org/preferences-service;1"]
		.getService(Ci.nsIPrefService)
		.getBranch("extensions.urlbox.");
	
	// URLを表示するラベル
	var label_ = null;
	
	// ロケーションバーに表示するかどうか
	var showInUrlbar_;
	
	// リンクをホバーしたとき呼び出される元々の関数
	var setOverLinkNative = XULBrowserWindow.setOverLink;
	
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
	function applyPreference() {
		if( !label_ )
			return;
		
		let button_ = document.getElementById("urlbox-button");
		
		if( pref_.getBoolPref("flex") ) {
			button_.flex = "1";
		} else {
			button_.flex = "0";
			button_.width = pref_.getIntPref("width");
		}
		
		switch( pref_.getIntPref("textAlign") ) {
		case 0:
			label_.style.textAlign = "left";
			break;
		case 1:
			label_.style.textAlign = "center";
			break;
		case 2:
			label_.style.textAlign = "right";
			break;
		}
		
		showInUrlbar_ = pref_.getBoolPref("showInUrlbar");
	}
	
	// preferenceの変更監視用オブジェクト
	var prefObserver_ = {
		observe: function(aSubject, aTopic, aData) {
			if( aTopic == "nsPref:changed" ) {
				applyPreference();
			}
		},
	};
	
	// リンクをホバーしたとき呼び出される関数 
	function setOverLinkOverlay(url, anchorElt) {
		label_.value = url;
		
		if( showInUrlbar_ ) {
			setOverLinkNative(url, anchorElt);
		}
	}
	
	// UIの状態を更新する
	function updateUIStatus() {
		label_ = document.getElementById("urlbox-label");
		
		if( label_ ) {
			applyPreference();
			XULBrowserWindow.setOverLink = setOverLinkOverlay;
		} else {
			XULBrowserWindow.setOverLink = setOverLinkNative;
		}
	}
	
	// ツールバーのカスタマイズの監視イベントリスナ
	function customizeChange(e) {
		updateUIStatus();
	}
	
	return {
		onLoad: function() {
			updateUIStatus();
			
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

window.addEventListener("load", urlbox.onLoad, false);
window.addEventListener("unload", urlbox.onUnload, false);
