import {
    BaseService,
    ServiceStatus
} from "./base.service";

interface IVideoElement extends HTMLElement {
    getPlayerState(): number;
    pauseVideo(): void;
    playVideo(): void;
}

export class YoutubeService extends BaseService {
    static domain = "youtube.com";

    public playingTitle(): string {
        const titleElement = document.querySelector(".watch-title-container");

        return titleElement ? titleElement.textContent.trim() : "";
    }

    public play() {
        const playerElement = document.getElementById("movie_player");

        if (playerElement && (<IVideoElement> playerElement).playVideo) {
            (<IVideoElement> playerElement).playVideo();
        } else if (playerElement.classList.contains("html5-main-video")) {
            (<HTMLMediaElement> playerElement).play();
        } else {
            let playButton = document.querySelector(".ytp-play-button") as HTMLElement;

            playButton && this.status === ServiceStatus.Paused && playButton.click();
        }
    }

    public pause() {
        const playerElement = document.getElementById("movie_player");

        if (playerElement && (<IVideoElement> playerElement).pauseVideo) {
            (<IVideoElement> playerElement).pauseVideo();
        } else if (playerElement.classList.contains("html5-main-video")) {
            (<HTMLMediaElement> playerElement).pause();
        } else {
            let playButton = document.querySelector(".ytp-play-button") as HTMLElement;

            playButton && this.status === ServiceStatus.Playing && playButton.click();
        }
    }

    public checkStatus(): ServiceStatus {
        const playerElement: HTMLElement = document.getElementById("movie_player");

        if (playerElement && (<IVideoElement> playerElement).getPlayerState) {
            return (<IVideoElement> playerElement).getPlayerState() == 1 ? ServiceStatus.Playing : ServiceStatus.Paused;
        } else if (playerElement.classList.contains("html5-main-video")) {
            const isPaused = (<HTMLMediaElement> playerElement).paused;
            const isPlayingAtZero = (
                !(<HTMLMediaElement> playerElement).paused
                && (<HTMLMediaElement> playerElement).currentTime == 0
            );

            return isPaused || isPlayingAtZero ? ServiceStatus.Paused : ServiceStatus.Playing;
        } else if (playerElement) {
            return playerElement.classList.contains("playing-mode") ? ServiceStatus.Playing : ServiceStatus.Paused;
        }
    }
}
