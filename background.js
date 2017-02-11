/* StoPlay Background JS */
"use strict";

var STOP_ICON = '/img/stop128.png',
	PLAY_ICON = '/img/icon128.png',
	DISABLED_ICON = '/img/icon128_disabled.png';

var version = chrome.app.getDetails().version;
var debug = false;

var providersList =
	["vk.com",
	"new.vk.com",
	"youtube.com",
	"vimeo.com",
	"muzebra.com",
	"pleer.net",
	"last.fm",
	"rutube.ru",
	"ted.com",
	"mixcloud.com",
	"soundcloud.com",
	"seasonvar.ru",
	"play.google.com",
	"music.yandex.ua",
	"music.yandex.ru",
	"v5player.slipstreamradio.com",
	"jazzradio.com",
	"tunein.com",
	"spotify.com",
	"play.spotify.com",
	"bandcamp.com",
	"promodj.com",
	"facebook.com",
	"kickstarter.com",
	"hearthis.at",
	"baboom.com",
	"player.vimeo.com",
	"courses.prometheus.org.ua",
	"dailymotion.com",
	"coursera.org"];
var providersDefault = providersList.map(function(item) {
	return {uri: item, enabled: true};
});

var DataStorage = {};
DataStorage.storage = localStorage;
DataStorage.get = function (name) {
    var value = this.storage.getItem(name);

    return value ? JSON.parse(value) : false;
};
DataStorage.set = function (name, value) {
    this.storage.setItem(name, JSON.stringify(value));
};

if (DataStorage.get('debug_mode')) {
	debug = true;
}

function logging() {
	if (!debug) {
		return;
	}
	console.log.apply(null, arguments);
}


function saveVersion() {
	DataStorage.set('version', version);
}
function saveToOptions(dataObject) {
	chrome.storage.sync.set(dataObject, function() {
		logging('STOPLAY saveToOptions saved');
	});
}

// Get options from chrome.storage.sync.
function restore_options(callback) {
	chrome.storage.sync.get({
		enabled: true,
		providers: providersDefault
	}, function(items) {
		var providersCurrent = mergeProviders(items.providers);
		if (callback) {
			callback.call(null, providersCurrent);
		}
	});
}

function onFirstRun() {
	logging('STOPLAY first_run');
	saveVersion();
	saveToOptions({providers: providersDefault});
}

// find missing providers and add from defaults
function mergeProviders(oldItems) {
	if (!Array.isArray(oldItems)) {
		logging('STOPLAY mergeProviders returning default values');
		return providersDefault;
	}
	logging('STOPLAY mergeProviders', oldItems);
	var providersFull = [],
		found = {};

	// remove old providers if they are not supported already
	var oldItemsClean = oldItems.filter(function(itemOld) {
		// if item is not found in providersDefault, then it is obsolete
		var itemsInBothLists = providersDefault.some(function(item) {
			return item.uri === itemOld.uri
		});
		return itemsInBothLists;
	});

	providersFull = providersDefault.map(function(itemDefault) {
		// looking if any of the new items have appeared
		// in older version of settings
		var found = oldItemsClean.find(function(itemOld) {
			return itemOld.uri === itemDefault.uri;
		});
		// if not found, add it
		if (!found) {
			return itemDefault;
		} else {
			return found;
		}
	});
	return providersFull;
}

DataStorage.set('status', 'silent');

if (!DataStorage.get('version')) {
	// first run
	onFirstRun();
} else if (DataStorage.get('version') != version) {
	// extension updated
	saveVersion();
	restore_options(function(providersMerged) {
		saveToOptions({providers: providersMerged});
	});
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (var key in changes) {
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
	var lastPlayingTabId = parseInt(DataStorage.get('lastPlayingTabId')),
		lastPausedTabId = parseInt(DataStorage.get('lastPausedTabId')),
		status = DataStorage.get('status');

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
	var lastPlayingTabId = parseInt(DataStorage.get('lastPlayingTabId')),
		lastPausedTabId = parseInt(DataStorage.get('lastPausedTabId')),
		status = DataStorage.get('status');

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
				DataStorage.set('lastPlayingTabId', sender.tab.id);
				DataStorage.set('status', 'playing');
				chrome.browserAction.setIcon({path: STOP_ICON});

				if (request.title) {
					chrome.browserAction.setTitle({title: "Playing: " + request.title});
				} else {
					chrome.browserAction.setTitle({title: "Playing: " + sender.tab.title});
				}

				break;

			case 'paused':
				DataStorage.set('lastPausedTabId', sender.tab.id);
				DataStorage.set('status', 'paused');
				chrome.browserAction.setIcon({path: PLAY_ICON});
				chrome.browserAction.setTitle({title: "StoPlay" });
				break;

			case 'toggle':
				if(lastPlayingTabId) {
					var action = (status == 'playing') ? 'pause' : 'play';
					chrome.tabs.sendMessage(lastPlayingTabId, {action: action});
				}
				break;
		}
	}
});

chrome.commands.onCommand.addListener(function(command) {
    var lastPlayingTabId = parseInt(DataStorage.get('lastPlayingTabId')),
        lastPausedTabId = parseInt(DataStorage.get('lastPausedTabId')),
        status = DataStorage.get('status');
    if(lastPlayingTabId) {
        var action = (status == 'playing') ? 'pause' : 'play';
        chrome.tabs.sendMessage(lastPlayingTabId, {action: action});
    }
});
chrome.tabs.onRemoved.addListener(function(tabId){
	var lastPlayingTabId = parseInt(DataStorage.get('lastPlayingTabId')),
		lastPausedTabId = parseInt(DataStorage.get('lastPausedTabId'));

	if(tabId == lastPlayingTabId) {
		DataStorage.set('lastPlayingTabId', null);
		if(lastPausedTabId != tabId) {
			chrome.tabs.sendMessage(lastPausedTabId, {action: 'play'});
		}
	}
});
