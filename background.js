/* StoPlay Background JS */

var STOP_ICON = '/img/stop128.png',
	PLAY_ICON = '/img/icon128.png',
	DISABLED_ICON = '/img/icon128_disabled.png';

var providersDefault = [
	{uri: 'vk.com', enabled: true},
	{uri: 'new.vk.com', enabled: true},
	{uri: 'youtube.com', enabled: true},
	{uri: 'vimeo.com', enabled: true},
	{uri: 'muzebra.com', enabled: true},
	{uri: 'pleer.com', enabled: true},
	{uri: 'last.fm', enabled: true},
	{uri: 'fs.to', enabled: true},
	{uri: 'brb.to', enabled: true},
	{uri: 'rutube.ru', enabled: true},
	{uri: 'ted.com', enabled: true},
	{uri: 'mixcloud.com', enabled: true},
	{uri: 'soundcloud.com', enabled: true},
	{uri: 'seasonvar.ru', enabled: true},
	{uri: 'play.google.com', enabled: true},
	{uri: 'music.yandex.ua', enabled: true},
	{uri: 'music.yandex.ru', enabled: true},
	{uri: 'v5player.slipstreamradio.com', enabled: true},
	{uri: 'jazzradio.com', enabled: true},
	{uri: 'tunein.com', enabled: true},
	{uri: 'spotify.com', enabled: true},
	{uri: 'play.spotify.com', enabled: true},
	{uri: 'bandcamp.com', enabled: true},
	{uri: 'promodj.com', enabled: true},
	{uri: 'facebook.com', enabled: true},
	{uri: 'kickstarter.com', enabled: true},
	{uri: 'hearthis.at', enabled: true},
	{uri: 'ex.ua', enabled: true},
	{uri: 'baboom.com', enabled: true},
	{uri: 'player.vimeo.com', enabled: true},
	{uri: 'courses.prometheus.org.ua', enabled: true},
	{uri: 'dailymotion.com', enabled: true}
];

localStorage.setItem('status', 'silent');

// first run
if (!localStorage.getItem('providersDefault')) {
	localStorage.setItem('providersDefault', JSON.stringify(providersDefault));
	console.log('STOPLAY first_run');

	chrome.storage.sync.set({
		providers: providersDefault
	}, function() {
		console.log('STOPLAY providersDefault saved');
	});

}

chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (key in changes) {
		var storageChange = changes[key];

		if (namespace === "sync" && key === "enabled") {
			var icon = PLAY_ICON;
			if (storageChange.newValue !== true) {
				icon = DISABLED_ICON;
			}
			chrome.browserAction.setIcon({path: icon});
		}
	}
});

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
			case 'updateTitle':
				if (request.title) {
					chrome.browserAction.setTitle({title: "Playing: " + request.title});
				}

				break;

			case 'started':
				if(lastPlayingTabId && sender.tab.id != lastPlayingTabId) {
					chrome.tabs.sendMessage(lastPlayingTabId, {action: 'pause'});
				}
				localStorage.setItem('lastPlayingTabId', sender.tab.id);
				localStorage.setItem('status', 'playing');
				chrome.browserAction.setIcon({path: STOP_ICON});

				if (request.title) {
					chrome.browserAction.setTitle({title: "Playing: " + request.title});
				} else {
					chrome.browserAction.setTitle({title: "Playing: " + sender.tab.title});
				}

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
