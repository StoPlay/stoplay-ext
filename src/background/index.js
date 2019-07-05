import {AppIcons} from "./models/AppIcons.js";
import {DataStorage} from "./services/DataStorage.js";
import {ProvidersList} from "./models/ProvidersList.js";
import {Actions} from "./models/Actions.js";
import {Status} from "./models/Status.js";

const version = chrome.app.getDetails().version;

let debug = false;
const providersDefault = ProvidersList.map(function (item) {
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
	chrome.storage.sync.set(dataObject, function () {
		logging('STOPLAY saveToOptions saved');
	});
}

// Get options from chrome.storage.sync.
function restoreOptions(callback) {
	chrome.storage.sync.get({
		enabled: true,
		providers: providersDefault
	}, function (items) {
		const providersCurrent = mergeProviders(items.providers);

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

	let providersFull = [];

	providersFull = providersDefault.map(function(itemDefault) {
		// looking if any of the new items have appeared
		// in older version of settings
		const found = oldItems.find(function (itemOld) {
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
	restoreOptions(function (providersMerged) {
		saveToOptions({providers: providersMerged});
	});
}

chrome.storage.onChanged.addListener(function (changes, namespace) {
	for (const key in changes) {
		const storageChange = changes[key];

		if (namespace === "sync" && key === "enabled") {
			let icon = AppIcons.PLAY_ICON;

			if (storageChange.newValue !== true) {
				icon = AppIcons.DISABLED_ICON;
			}

			chrome.browserAction.setIcon({path: icon});
		}
	}
});

chrome.browserAction.onClicked.addListener(function () {
	const lastPlayingTabId = parseInt(DataStorage.get('lastPlayingTabId'));
	const lastPlayingFrameId = parseInt(DataStorage.get('lastPlayingFrameId')) || 0;
	const lastPausedTabId = parseInt(DataStorage.get('lastPausedTabId'));
	const lastPausedFrameId = parseInt(DataStorage.get('lastPausedFrameId')) || 0;
	const status = DataStorage.get('status');

	switch (status) {
		case Status.PLAYING:
			if (lastPlayingTabId) {
				chrome.tabs.sendMessage(
					lastPlayingTabId,
					{action: Actions.PAUSE},
					{frameId: lastPlayingFrameId}
				);
			}
			break;

		case Status.PAUSED:
			if (lastPlayingTabId) {
				chrome.tabs.sendMessage(
					lastPausedTabId,
					{action: Actions.PLAY},
					{frameId: lastPausedFrameId}
				);
			}
			break;
	}
})

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	const lastPlayingTabId = parseInt(DataStorage.get('lastPlayingTabId'));
	const lastPlayingFrameId = parseInt(DataStorage.get('lastPlayingFrameId')) || 0;
	const lastPausedTabId = parseInt(DataStorage.get('lastPausedTabId'));
	const status = DataStorage.get('status');

	if (!request.action || !sender.tab) {
		return;
	}

	switch (request.action) {
		case 'updateTitle':
			if (!request.title) {
				break;
			}

			chrome.browserAction.setTitle({title: "Playing: " + request.title});
			break;

		case 'started':
			const isFrameIdChanged = (lastPlayingTabId && sender.frameId != lastPlayingFrameId);
			const hasLastPlayingTabId = Boolean(lastPausedTabId);
			const senderIsNotLastPlaying = sender.tab.id !== lastPausedTabId;

			if (hasLastPlayingTabId && senderIsNotLastPlaying || isFrameIdChanged) {
				chrome.tabs.sendMessage(
					lastPlayingTabId,
					{action: Actions.PAUSE},
					{frameId: lastPlayingFrameId}
				);
			}

			DataStorage.set('lastPlayingTabId', sender.tab.id);
			DataStorage.set('lastPlayingFrameId', sender.frameId);
			DataStorage.set('status', Status.PLAYING);

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
			DataStorage.set('status', Status.PAUSED);

			chrome.browserAction.setIcon({path: AppIcons.PLAY_ICON});
			chrome.browserAction.setTitle({title: "StoPlay"});
			break;

		case 'toggle':
			if (!lastPlayingTabId) {
				break;
			}

			const action = status === Status.PLAYING
				? Actions.PAUSE
				: Actions.PLAY;

			chrome.tabs.sendMessage(lastPlayingTabId, {action: action});

			break;
	}
});

chrome.commands.onCommand.addListener(function (command) {
	const lastPlayingTabId = parseInt(DataStorage.get('lastPlayingTabId'));
	const lastPlayingFrameId = parseInt(DataStorage.get('lastPlayingFrameId')) || 0;
	const lastPausedTabId = parseInt(DataStorage.get('lastPausedTabId'));
	const lastPausedFrameId = parseInt(DataStorage.get('lastPausedFrameId')) || 0;
	const status = DataStorage.get('status');

	let action = Actions.PAUSE;
	let frameId = lastPlayingFrameId;
	let tabId = lastPlayingTabId;

	if (status !== Status.PLAYING) {
		tabId = lastPausedTabId;
		action = Actions.PLAY;
		frameId = lastPausedFrameId;
	}

	if (tabId) {
		chrome.tabs.sendMessage(tabId, {action}, {frameId});
	}
});

chrome.tabs.onRemoved.addListener(function (tabId){
	const lastPlayingTabId = parseInt(DataStorage.get('lastPlayingTabId'));
	const lastPausedTabId = parseInt(DataStorage.get('lastPausedTabId'));
	const lastPausedFrameId = parseInt(DataStorage.get('lastPausedFrameId')) || 0;

	if (tabId === lastPlayingTabId) {
		DataStorage.set('lastPlayingTabId', null);

		if (lastPausedTabId !== tabId) {
			chrome.tabs.sendMessage(
				lastPausedTabId,
				{action: Actions.PLAY},
				{frameId: lastPausedFrameId}
			);
		}
	}
});
