let instance = null;

export class DataStorageEngine {
    constructor(storageEngine) {
        this.storage = storageEngine;
    }

    static getInstance() {
        if (!instance) {
            instance = new DataStorageEngine(window.localStorage);
        }

        return instance;
    }

    get(name) {
        const value = this.storage.getItem(name);

        if (!value) {
            return false;
        }

        return JSON.parse(value);
    }

    set(name, value) {
        this.storage.setItem(name, JSON.stringify(value));
    }
}

export const DataStorage = DataStorageEngine.getInstance();