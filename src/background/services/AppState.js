import {DataStorage} from "./DataStorage.js";

let instance = null;

const storageKeys = {
    // debug_mode: "debug_mode", reserved by DebugMode module
    version: "version",
    status: "status",

    lastPlayingTabId: "lastPlayingTabId",
    lastPlayingFrameId: "lastPlayingFrameId",
    lastPausedTabId: "lastPausedTabId",
    lastPausedFrameId: "lastPausedFrameId",
};

export class AppState {
    constructor() {
        this.storage = DataStorage;
    }

    static getInstance() {
        if (!instance) {
            instance = new AppState();
        }

        return instance;
    }

    getVersion() {
        return this.storage.get(storageKeys.version);
    }

    setVersion(value) {
        return this.storage.set(storageKeys.version, value);
    }

    getStatus() {
        return this.storage.get(storageKeys.status);
    }

    setStatus(value) {
        return this.storage.set(storageKeys.status, value);
    }

    getLastPlayingTabId() {
        return this.storage.get(storageKeys.lastPlayingTabId);
    }

    setLastPlayingTabId(value) {
        return this.storage.set(storageKeys.lastPlayingTabId, value);
    }

    getLastPlayingFrameId() {
        return this.storage.get(storageKeys.lastPlayingFrameId);
    }

    setLastPlayingFrameId(value) {
        return this.storage.set(storageKeys.lastPlayingFrameId, value);
    }

    getLastPausedTabId() {
        return this.storage.get(storageKeys.lastPausedTabId);
    }

    setLastPausedTabId(value) {
        return this.storage.set(storageKeys.lastPausedTabId, value);
    }

    getLastPausedFrameId() {
        return this.storage.get(storageKeys.lastPausedFrameId);
    }

    setLastPausedFrameId(value) {
        return this.storage.set(storageKeys.lastPausedFrameId, value);
    }
}
