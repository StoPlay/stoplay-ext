import {AppIcons} from "./AppIcons.js";
import {DataStorage} from "./DataStorage.js";
import {ProvidersList} from "./ProvidersList.js";

const version = chrome.app.getDetails().version;

let debug = false;
const providersDefault = ProvidersList.map(function(item) {
	return {uri: item, enabled: true};
});

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
function restoreOptions(callback) {
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

	providersFull = providersDefault.map(function(itemDefault) {
		// looking if any of the new items have appeared
		// in older version of settings
		var found = oldItems.find(function(itemOld) {
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
	restoreOptions(function(providersMerged) {
		saveToOptions({providers: providersMerged});
	});
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (var key in changes) {
		var storageChange = changes[key];

		if (namespace === "sync" && key === "enabled") {
			var icon = AppIcons.PLAY_ICON;
			if (storageChange.newValue !== true) {
				icon = AppIcons.DISABLED_ICON;
			}
			chrome.browserAction.setIcon({path: icon});
		}
	}
});

chrome.browserAction.onClicked.addListener(function(e) {
	var lastPlayingTabId = parseInt(DataStorage.get('lastPlayingTabId')),
        lastPlayingFrameId = parseInt(DataStorage.get('lastPlayingFrameId')) || 0,
		lastPausedTabId = parseInt(DataStorage.get('lastPausedTabId')),
        lastPausedFrameId = parseInt(DataStorage.get('lastPausedFrameId')) || 0,
		status = DataStorage.get('status');

	switch(status) {
		case "playing":
			if(lastPlayingTabId) {
				chrome.tabs.sendMessage(lastPlayingTabId, {action: 'pause'}, {frameId: lastPlayingFrameId});
			}
			break;

		case "paused":
			if(lastPlayingTabId) {
				chrome.tabs.sendMessage(lastPausedTabId, {action: 'play'}, {frameId: lastPausedFrameId});
			}
			break;
	}
})

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	var lastPlayingTabId = parseInt(DataStorage.get('lastPlayingTabId')),
		lastPlayingFrameId = parseInt(DataStorage.get('lastPlayingFrameId')) || 0,
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
				var isFrameIdChanged = (lastPlayingTabId && sender.frameId != lastPlayingFrameId);
				if(lastPlayingTabId && sender.tab.id != lastPlayingTabId || isFrameIdChanged) {
					chrome.tabs.sendMessage(lastPlayingTabId, {action: 'pause'}, {frameId: lastPlayingFrameId});
				}
				DataStorage.set('lastPlayingTabId', sender.tab.id);
				DataStorage.set('lastPlayingFrameId', sender.frameId);
				DataStorage.set('status', 'playing');
				chrome.browserAction.setIcon({path: AppIcons.STOP_ICON});
				if (request.title) {
					chrome.browserAction.setTitle({title: "Playing: " + request.title});
				} else {
					chrome.browserAction.setTitle({title: "Playing: " + sender.tab.title});
				}
				break;

			case 'paused':
				DataStorage.set('lastPausedTabId', sender.tab.id);
				DataStorage.set('lastPausedFrameId', sender.frameId);
				DataStorage.set('status', 'paused');
				chrome.browserAction.setIcon({path: AppIcons.PLAY_ICON});
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
        lastPausedFrameId = parseInt(DataStorage.get('lastPausedFrameId')) || 0,
        status = DataStorage.get('status');
    if(lastPlayingTabId) {
        var action = (status == 'playing') ? 'pause' : 'play';
        chrome.tabs.sendMessage(lastPlayingTabId, {action: action}, {frameId: lastPausedFrameId});
    }
});
chrome.tabs.onRemoved.addListener(function(tabId){
	var lastPlayingTabId = parseInt(DataStorage.get('lastPlayingTabId')),
		lastPausedTabId = parseInt(DataStorage.get('lastPausedTabId')),
		lastPausedFrameId = parseInt(DataStorage.get('lastPausedFrameId')) || 0;
	if(tabId == lastPlayingTabId) {
		DataStorage.set('lastPlayingTabId', null);
		if(lastPausedTabId != tabId) {
			chrome.tabs.sendMessage(lastPausedTabId, {action: 'play'}, {frameId: lastPausedFrameId});
		}
	}
});

