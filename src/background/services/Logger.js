import {AppState} from "./AppState.js";

const appState = AppState.getInstance();
const DEBUG = appState.getDebugMode();

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
