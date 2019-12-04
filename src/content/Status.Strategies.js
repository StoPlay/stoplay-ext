import { Status } from './Status.Types.js';

export class BaseStatusStrategy {
  static getStatus() {}
}

export class checkSelector extends BaseStatusStrategy {
  static getStatus() {
    let el = document.querySelector(arguments[0]);
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
