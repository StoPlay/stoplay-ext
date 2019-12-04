import { Status } from './Status.Types.js';

export class BaseStatusStrategy {
  static getStatus() {}
}

/* A shared mixin for when there is a video tag on page */
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
