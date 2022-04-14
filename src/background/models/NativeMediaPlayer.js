import {Status} from "./Status";

export class NativeMediaPlayer {
    selector;

    constructor(selector) {
        this.selector = selector;
    }

    status() {
        const player = this.#getElement();

        if (player && player.paused === false) {
          return Status.PLAYING;
        }

        return Status.PAUSED;
    }

    play() {
        if (this.status() === Status.PLAYING) {
            return;
        }

        const player = this.#getElement();
        if (!player || !player.paused) {
            return;
        }

        player.play();
    }

    pause() {
        if (this.status() !== Status.PLAYING) {
            return;
        }

        const player = this.#getElement();
        if (!player || player.paused) {
            return;
        }

        player.pause();
    }

    #getElement() {
        return document.querySelector(this.selector);
    }
}
