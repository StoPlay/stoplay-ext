export enum ServiceStatus {
	Paused,
	Playing
}

export interface IStaticService {
	new(): BaseService;
	domain: string | Array<string>;
}

export abstract class BaseService {
	public status = ServiceStatus.Paused;

	private interval: number;
	private checkTitleInterval: number;
	private events: {[index: string]: Array<() => void>} = {};

	abstract play(): void;
	abstract pause(): void;
	abstract checkStatus(): ServiceStatus;
	
	constructor() {
		console.info("blyaaa");
		this.interval = setInterval(() => {
			const status = this.checkStatus();

			if (status !== this.status) {
				this.changeState(status);
			}

			this.checkAnnoyingLightboxes();
		}, 1000);

		// const checkTitleInterval = setInterval(() => this.checkTitle(), 10000);
	}

	public playingTitle(): string {
		return "";
	}

	private checkTitle() {
		// TODO: fix dis shit
		var currentTitle = this.playingTitle;

		// 1 === 1? rly?
		if (currentTitle !== this.playingTitle) {
			// this.playingTitle = currentTitle;
			this.onUpdateTitle();
		}
	};

	protected changeState(status: ServiceStatus) {
		if (status != this.status) {
			switch(status) {
				case ServiceStatus.Playing:
					this.onStart();
					break;

				case ServiceStatus.Paused:
					this.onPause();
					break;
			}
		}

		this.status = status;
	}

	private on(name: string, callback: () => void) {
		if (this.events.hasOwnProperty(name)) {
			this.events[name] = [];
		}

		this.events[name].push(callback);

		return this;
	}

	private onStart = () => {
		this.status = ServiceStatus.Playing;
		chrome.runtime.sendMessage({action: 'started', title: this.playingTitle});
	};

	private onPause = () => {
		this.status = ServiceStatus.Paused;
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

	public checkAnnoyingLightboxes() {
	}
}
