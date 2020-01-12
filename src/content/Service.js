/* Base Service class */
export class Service {
  /**
    @param options {Object}
    @param options.statusStrategy {Class}
    @param options.statusArgs {Array} (optional)
    @param options.controlStrategy {Class}
    @param options.playArgs {Array} (optional)
    @param options.pauseArgs {Array} (optional)
    */
  constructor(options) {
    this.options = options;
  }

  getStatus() {
    return this.options.statusStrategy.getStatus.apply(this, this.options.statusArgs);
  }

  play() {
    this.options.controlStrategy.play.apply(this, this.options.playArgs);
  }

  pause() {
    this.options.controlStrategy.pause.apply(this, this.options.pauseArgs);
  }
}
