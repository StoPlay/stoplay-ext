/* A shared mixin for when there is a video tag on page */
import { Status } from '../Status.Types.js';

export const checkStatus = () => {
  let status;
  const videos = document.getElementsByTagName("video");
  if (videos.length > 0) {
    const hasPlayingVideo = Array.from(videos).some((player) => !player.paused);
    status = hasPlayingVideo ? Status.PLAYING : Status.PAUSED;
  }
  return status;
}
