import {AppIcons} from "./models/AppIcons.js";
import {ProvidersList} from "./models/ProvidersList.js";
import {Actions} from "./models/Actions.js";
import {Status} from "./models/Status.js";
import {AppState} from "./services/AppState.js";
import {Logger} from "./services/Logger.js";

const appState = AppState.getInstance();
const version = chrome.app.getDetails().version;
const providersDefault = ProvidersList.map((item) => {
	return {uri: item, enabled: true};
});

function saveToOptions(dataObject) {
	chrome.storage.sync.set(dataObject, () => {
		Logger.log('STOPLAY saveToOptions saved');
	});
}

// Get options from chrome.storage.sync.
function restoreOptions(callback) {
	chrome.storage.sync.get({
		enabled: true,
		providers: providersDefault
	}, (items) => {
		const providersCurrent = mergeProviders(items.providers);

		if (typeof callback === 'function') {
			callback(providersCurrent);
		}
	});
}

function onFirstRun() {
	Logger.log('STOPLAY first_run');
	appState.setVersion(version);
	saveToOptions({providers: providersDefault});
}

// find missing providers and add from defaults
function mergeProviders(oldItems) {
	if (!Array.isArray(oldItems)) {
		Logger.log('STOPLAY mergeProviders returning default values');
		return providersDefault;
	}

	Logger.log('STOPLAY mergeProviders', oldItems);

	return providersDefault.map(function(itemDefault) {
		// looking if any of the new items have appeared
		// in older version of settings
		const found = oldItems.find((itemOld) => {
			return itemOld.uri === itemDefault.uri;
		});

		// if not found, add it
		if (!found) {
			return itemDefault;
		} else {
			return found;
		}
	});
}

function resetProviders(callback) {
	restoreOptions(function(providersMerged) {
		saveToOptions({providers: providersMerged});
		if (typeof callback === 'function') {
			callback(providersMerged);
		}
	})
}

appState.setStatus("silent");

if (!appState.getVersion()) {
	// first run
	onFirstRun();
} else if (appState.getVersion() !== version) {
	// extension updated
	appState.setVersion(version);
	resetProviders();
}

chrome.storage.onChanged.addListener((changes, namespace) => {
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

chrome.browserAction.onClicked.addListener(() => {
	const lastPlayingTabId = appState.getLastPlayingTabId();
	const lastPlayingFrameId = appState.getLastPlayingFrameId() || 0;
	const lastPausedTabId = appState.getLastPausedTabId();
	const lastPausedFrameId = appState.getLastPausedFrameId() || 0;
	const status = appState.getStatus();

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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	const lastPlayingTabId = appState.getLastPlayingTabId();
	const lastPlayingFrameId = appState.getLastPlayingFrameId() || 0;
	const lastPausedTabId = appState.getLastPausedTabId();
	const status = appState.getStatus();
	const isOptionsPage = sender.url.indexOf(chrome.runtime.id) > -1;
	const hasNoAction = !request.action;
	const hasNoTab = !sender.tab && !isOptionsPage;

	if (hasNoAction || hasNoTab) {
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

			appState.setLastPlayingTabId(sender.tab.id);
			appState.setLastPlayingFrameId(sender.frameId);
			appState.setStatus(Status.PLAYING);

			chrome.browserAction.setIcon({path: AppIcons.STOP_ICON});

			if (request.title) {
				chrome.browserAction.setTitle({title: "Playing: " + request.title});
			} else {
				chrome.browserAction.setTitle({title: "Playing: " + sender.tab.title});
			}
			break;

		case 'paused':
			appState.setLastPausedTabId(sender.tab.id);
			appState.setLastPausedFrameId(sender.frameId);
			appState.setStatus(Status.PAUSED);

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

		case 'resetProviders':
			resetProviders((providers) => {
				sendResponse({
					providers
				})
			});
			break;
	}
});

chrome.commands.onCommand.addListener(() => {
	const lastPlayingTabId = appState.getLastPlayingTabId();
	const lastPlayingFrameId = appState.getLastPlayingFrameId() || 0;
	const lastPausedTabId = appState.getLastPausedTabId();
	const lastPausedFrameId = appState.getLastPausedFrameId() || 0;
	const status = appState.getStatus();

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

chrome.tabs.onRemoved.addListener((tabId) => {
	const lastPlayingTabId = appState.getLastPlayingTabId();
	const lastPausedTabId = appState.getLastPausedTabId();
	const lastPausedFrameId = appState.getLastPausedFrameId() || 0;

	if (tabId === lastPlayingTabId) {
		appState.setLastPlayingTabId(null);

		if (lastPausedTabId !== tabId) {
			chrome.tabs.sendMessage(
				lastPausedTabId,
				{action: Actions.PLAY},
				{frameId: lastPausedFrameId}
			);
		}
	}
});
