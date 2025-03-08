import DebugMode from './DebugMode.js';

export class Logger {
    static log() {
        if (!DebugMode()) {
            return;
        }

        console.log.apply(null, arguments);
    }

    static error() {
        if (!DebugMode()) {
            return;
        }

        console.error.apply(null, arguments);
    }
}
