import { Status } from "../background/models/Status";

export class ElementExistsStatus {
    #selector;

    constructor(selector) {
        this.#selector = selector;
    }

    getStatus() {
        return document.querySelector(this.#selector) ? Status.PLAYING : Status.PAUSED;
    }
}
