
import { Status } from './Status.Types.js';

export class BaseControlStrategy {
  static play() {}
  static pause() {}
}


export class clickSelector extends BaseControlStrategy {
  static play(className) {
    let element = document.querySelector(className);
    if (!element) {
      return;
    }

    element.click();
  }

  static pause(className) {
    clickSelector.play(className);
  }
}

/* clicking the storedSelector, injected by the Service */
export class clickStoredSelector extends BaseControlStrategy {
  static play() {
    if (this.selector) {
      this.selector.click();
    }
  }

  static pause() {
    clickStoredSelector.play.call(this);
  }
}

/* custom for jouele, based on its buttons position */
export class joueleStoredSelector extends BaseControlStrategy {
  static pause() {
    clickStoredSelector.pause.call(this);
  }

  static play() {
    if (this.selector) {
      this.selector.previousSibling.click();
    }
  }
}


export class oneOfTheVideos extends BaseControlStrategy {
  static getVideosArray() {
    return Array.from(document.getElementsByTagName('video'));
  }

  static pause() {
    oneOfTheVideos.getVideosArray()
      .filter((player) => !player.paused)
      .forEach((player) => {
        player.pause();
      });
  }

  static play() {
    oneOfTheVideos.getVideosArray()
      .filter((player) => player.paused && player.played.length > 0)
      .forEach((player) => {
        player.play();
      });
  }

}
