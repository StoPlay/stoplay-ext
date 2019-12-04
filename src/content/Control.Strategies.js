
import { Status } from './Status.Types.js';

export class BaseControlStrategy {
  static play() {}
  static pause() {}
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
