const chrome: any = {};

export enum ProviderStatus {
	Paused,
	Playing
}

export abstract class BaseProvider {
	public status = ProviderStatus.Paused;
	public playingTitle = "";

	private interval: number;
	private checkTitleInterval: number;
	private events = {};

	abstract checkStatus(): ProviderStatus;

	protected changeState(status: ProviderStatus) {
		if (status != this.status) {
			switch(status) {
				case ProviderStatus.Playing:
					this.onStart();
					break;

				case ProviderStatus.Paused:
					this.onPause();
					break;
			}
		}
	}

	private on(name: string, callback: () => void) {
		if (this.events.hasOwnProperty(name)) {
			this.events[name] = [];
		}

		this.events[name].push(callback);

		return this;
	}

	private onStart = () => {
		this.status = ProviderStatus.Playing;
		chrome.runtime.sendMessage({action: 'started', title: this.playingTitle});
	};

	private onPause = () => {
		this.status = ProviderStatus.Paused;
		chrome.runtime.sendMessage({action: 'paused'});
	};

	private onUpdateTitle = () => {
		chrome.runtime.sendMessage({action: 'updateTitle', title: this.playingTitle});
	};

	private attachEvents() {
		this.on("start", this.onStart);
		this.on("pause", this.onPause);
		this.on("updateTitle", this.onUpdateTitle);
	}
}
