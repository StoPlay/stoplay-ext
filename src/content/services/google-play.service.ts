import {
    BaseService,
    ServiceStatus
} from "./base.service";

export class GooglePlayService extends BaseService {
    static domain = "play.google.com";

    public playingTitle(): string {
        const songName = document.getElementById('currently-playing-title').textContent,
            songArtist = document.getElementById('player-artist').textContent;

        return `${songArtist} - ${songName}`;
    }

    public checkStatus(): ServiceStatus {
        const element = <HTMLElement> document.querySelector('[data-id="play-pause"]');

        return element.classList.contains('playing') ? ServiceStatus.Playing : ServiceStatus.Paused;
    }

    public play() {
        this.togglePausePlay();
    }

    public pause() {
        this.togglePausePlay();
    }

    private togglePausePlay() {
        const button = <HTMLElement> document.querySelector('[data-id="play-pause"]');

        if (button) {
            button.click();
        }
    }
}
