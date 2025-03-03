import { isServiceWorker } from "../../utils/isServiceWorker";
import { Logger } from "./Logger";

class DataStorageEngineSW {
    constructor() {
        this.storage = chrome.storage.local;
    }

    get(name) {
        let resultValue;
        this.storage.get(name, function (result) {
            console.log("DataStorageEngineSW get", name, result);
            resultValue = result[name];
        });

        return resultValue;
    }

    set(name, value) {
        this.storage.set({ [name]: value }, function () {
            console.log("DataStorageEngineSW set", name, value);
        });
    }
}

class DataStorageEngineWindow {
    constructor() {
        this.storage = window.localStorage;
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

let instance;

if (!instance) {
    console.log("DataStorageEngine", isServiceWorker());
    if (isServiceWorker()) {
        instance = new DataStorageEngineSW();
    } else {
        instance = new DataStorageEngineWindow();
    }
}

export const DataStorage = instance;
