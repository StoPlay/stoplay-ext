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
    return this.options.statusStrategy.getStatus.apply(null, this.options.statusArgs);
  }

  play() {
    this.options.controlStrategy.play.apply(null, this.options.playArgs);
  }

  pause() {
    this.options.controlStrategy.pause.apply(null, this.options.pauseArgs);
  }
}
