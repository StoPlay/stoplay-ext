import { Logger } from "./Logger";

class MemoryStorage {
    constructor() {
        this.storage = {};
    }

    get(name) {
        Logger.log('STOPLAY DataStorage get', name, this.storage[name]);
        return this.storage[name];
    }

    set(name, value) {
        Logger.log('STOPLAY DataStorage set', name, value);
        this.storage[name] = value;
    }
}

let instance;

if (!instance) {
    instance = new MemoryStorage();
}

export const DataStorage = instance;
