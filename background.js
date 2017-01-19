/* StoPlay Background JS */

var STOP_ICON = '/img/stop128.png',
    PLAY_ICON = '/img/icon128.png',
    DISABLED_ICON = '/img/icon128_disabled.png';

localStorage.setItem('status', 'silent');

var DataStorage = {};
DataStorage.storage = localStorage;
DataStorage.get = function (name) {
    var value = this.storage.getItem(name);

    return value ? JSON.parse(value) : false;
};
DataStorage.set = function (name, value) {
    this.storage.setItem(name, JSON.stringify(value));
};

var Queue = {};
Queue.last = function () {
    return DataStorage.get('queue').slice(-1).pop();
};

Queue.push = function (tabId) {
    var queue;

    this.remove(tabId);
    
    queue = DataStorage.get('queue') || [];
    queue.push(tabId);

    DataStorage.set('queue', queue);
};

Queue.remove = function (tabId) {
    DataStorage.set('queue', DataStorage.get('queue').filter(function (item) { return item !== tabId; }));
};

chrome.storage.onChanged.addListener(function(changes, namespace) {
    var key;
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
                Queue.push(sender.tab.id);
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

    Queue.remove(tabId);
    if(tabId == lastPlayingTabId) {
        localStorage.setItem('lastPlayingTabId', null);
        resumeTabId = Queue.last();
        if (resumeTabId) {
            chrome.tabs.sendMessage(resumeTabId, {action: 'play'});
        }
    }
});
