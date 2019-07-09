import {Logger} from "./Logger";

let instance;

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

        let parsedValue;

        try {
            parsedValue = JSON.parse(value);
        } catch (exception) {
            Logger.error(exception)
        }

        return parsedValue;
    }

    set(name, value) {
        this.storage.setItem(name, JSON.stringify(value));
    }
}

export const DataStorage = DataStorageEngine.getInstance();
