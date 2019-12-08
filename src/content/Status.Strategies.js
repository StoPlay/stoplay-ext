import { Status } from './Status.Types.js';

export class BaseStatusStrategy {
  static getStatus() {}
}

/* simple check for selector */
export class checkSelector extends BaseStatusStrategy {
  static getStatus(className) {
    let el = document.querySelector(className);
    return el ? Status.PLAYING : Status.PAUSED;
  }
}

/* check for selector and store it */
export class checkSelectorAndStore extends BaseStatusStrategy {
  static getStatus(className, storeSelector) {
    let el = document.querySelector(className);
    if (el) {
      // this is the Service context
      this.selector = el;
    }
    return el ? Status.PLAYING : Status.PAUSED;
  }
}

/* when there are video tags on page */
export class oneOfTheVideosPlaying extends BaseStatusStrategy {
  static getStatus() {
    let status = Status.PAUSED;
    const videos = document.getElementsByTagName("video");
    if (videos.length > 0) {
      const hasPlayingVideo = Array.from(videos).some((player) => !player.paused);
      status = hasPlayingVideo ? Status.PLAYING : Status.PAUSED;
    }
    return status;
  }
}
