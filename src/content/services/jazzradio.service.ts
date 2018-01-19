import {
	BaseService,
	ServiceStatus
} from "./base.service";

export class JazzradioService extends BaseService {
	static domain = "jazzradio.com";

	public play() {
		const button = <HTMLElement> document.querySelector('#ctl-play > .icon-play');

		if (button) {
			button.click();
		}
	}

	public pause() {
		const button = <HTMLElement> document.querySelector('#ctl-play > .icon-stop');

		if (button) {
			button.click();
		}
	}

	public checkStatus(): ServiceStatus {
		const element = document.querySelector('#now-playing .status');

		if (element && element.textContent.toLocaleLowerCase() === "now display") {
			return ServiceStatus.Playing;
		}

		return ServiceStatus.Paused;
	}

	public checkAnnoyingLightboxes() {
		const modal = <HTMLElement> document.getElementById('modal-region');

		if (modal && modal.style.display == 'block') {
			const closeButton = <HTMLElement> modal.querySelector('.close');

			closeButton && closeButton.click();
		}
	}
}
