import {
	BaseProvider,
	ProviderStatus
} from "../base.provider";

export class GooglePlayProvider {
	static domain = "play.google.com";

	get playingTitle(): string {
		const songName = document.getElementById('currently-playing-title').textContent,
			songArtist = document.getElementById('player-artist').textContent;

		return `${songArtist} - ${songName}`;
	}

	protected checkStatus(): ProviderStatus {
		const element = document.querySelector('[data-id="play-pause"]');

		return element.classList.contains('playing') ? ProviderStatus.Playing : ProviderStatus.Paused;
	}
}
