import DebugMode from './DebugMode.js';

let DEBUG = false;

DebugMode.then((debugMode) => {
    DEBUG = debugMode;
});

export class Logger {
    static log() {
        if (!DEBUG) {
            return;
        }

        console.log.apply(null, arguments);
    }

    static error() {
        if (!DEBUG) {
            return;
        }

        console.error.apply(null, arguments);
    }
}
