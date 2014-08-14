/* StoPlay Background JS */

var STOP_ICON = '/img/stop128.png',
	PLAY_ICON = '/img/icon128.png';

localStorage.setItem('status', 'silent');

chrome.browserAction.onClicked.addListener(function(e) {
	var lastPlayingTabId = parseInt(localStorage.getItem('lastPlayingTabId')),
		lastPausedTabId = parseInt(localStorage.getItem('lastPausedTabId')),
		status = localStorage.getItem('status');
	
	switch(status) {
		case "playing":
			if(lastPlayingTabId) {
				chrome.tabs.sendMessage(lastPlayingTabId, {action: 'pause'});
			}
			break;

		case "paused":
			if(lastPlayingTabId) {
				chrome.tabs.sendMessage(lastPlayingTabId, {action: 'play'});
			}
			break;
	}
})

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	var lastPlayingTabId = parseInt(localStorage.getItem('lastPlayingTabId')),
		lastPausedTabId = parseInt(localStorage.getItem('lastPausedTabId')),
		status = localStorage.getItem('status');

	if(request.action && sender.tab) {
		switch(request.action) {
			case 'started':
				if(lastPlayingTabId && sender.tab.id != lastPlayingTabId) {
					chrome.tabs.sendMessage(lastPlayingTabId, {action: 'pause'});
				}
				localStorage.setItem('lastPlayingTabId', sender.tab.id);
				localStorage.setItem('status', 'playing');
				chrome.browserAction.setIcon({path: STOP_ICON});

				break;
				
			case 'paused':
				localStorage.setItem('lastPausedTabId', sender.tab.id);
				localStorage.setItem('status', 'paused');
				chrome.browserAction.setIcon({path: PLAY_ICON});
				chrome.browserAction.setTitle({title: "StoPlay" });
				break;

			case 'toggle':
				console.log(request.action, lastPlayingTabId);
				if(lastPlayingTabId) {
					var action = (status == 'playing') ? 'pause' : 'play';
					chrome.tabs.sendMessage(lastPlayingTabId, {action: action});
				}
				break;
		}
	}
});

chrome.commands.onCommand.addListener(function(command) {
    var lastPlayingTabId = parseInt(localStorage.getItem('lastPlayingTabId')),
        lastPausedTabId = parseInt(localStorage.getItem('lastPausedTabId')),
        status = localStorage.getItem('status');
    if(lastPlayingTabId) {
        var action = (status == 'playing') ? 'pause' : 'play';
        chrome.tabs.sendMessage(lastPlayingTabId, {action: action});
    }
});
chrome.tabs.onRemoved.addListener(function(tabId){
	var lastPlayingTabId = parseInt(localStorage.getItem('lastPlayingTabId')),
		lastPausedTabId = parseInt(localStorage.getItem('lastPausedTabId'));

	if(tabId == lastPlayingTabId) {
		localStorage.setItem('lastPlayingTabId', null);
		if(lastPausedTabId != tabId) {
			chrome.tabs.sendMessage(lastPausedTabId, {action: 'play'});
		}
	}
});