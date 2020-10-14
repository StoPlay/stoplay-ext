import DebugMode from './DebugMode.js';

const DEBUG = DebugMode;

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
