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
        this.storage.set(storageKeys.version, value);
    }

    getStatus() {
        this.storage.get(storageKeys.status);
    }

    setStatus(value) {
        this.storage.set(storageKeys.status, value);
    }

    getLastPlayingTabId() {
        this.storage.get(storageKeys.lastPlayingTabId);
    }

    setLastPlayingTabId(value) {
        this.storage.set(storageKeys.lastPlayingTabId, value);
    }

    getLastPlayingFrameId() {
        this.storage.get(storageKeys.lastPlayingFrameId);
    }

    setLastPlayingFrameId(value) {
        this.storage.set(storageKeys.lastPlayingFrameId, value);
    }

    getLastPausedTabId() {
        this.storage.get(storageKeys.lastPausedTabId);
    }

    setLastPausedTabId(value) {
        this.storage.set(storageKeys.lastPausedTabId, value);
    }

    getLastPausedFrameId() {
        this.storage.get(storageKeys.lastPausedFrameId);
    }

    setLastPausedFrameId(value) {
        this.storage.set(storageKeys.lastPausedFrameId, value);
    }
}
