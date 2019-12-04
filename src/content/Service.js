/* Base Service class */
export class Service {
  constructor(options) {
    this.options = options;
  }

  getStatus() {
    return this.options.statusStrategy.getStatus();
  }

  play() {
    this.options.controlStrategy.play();
  }

  pause() {
    this.options.controlStrategy.pause();
  }
}
