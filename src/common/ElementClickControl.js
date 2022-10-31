export class ElementClickControl {
    #controlSelector;

    /**
     * playSelector here optional for cases when needed different one
     */
    constructor(controlSelector) {
        this.#controlSelector = controlSelector;
    }

    evaluate() {
        const element = document.querySelector(this.#controlSelector);

        if (!element) {
            return;
        }

        element.click();
    }
}