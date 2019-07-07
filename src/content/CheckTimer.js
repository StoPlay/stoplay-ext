// CheckTimer

export class CheckTimer {
  /**
   * CheckTimerOptions

    delay (int) - timer delay in ms
    callback (function) - function to call on delay
    recursive (boolean) - restart timer after callback is fired

   */
  constructor(options) {
    this.options = options;
    this.timer = null;

    this.check = this.check.bind(this);
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
  }

  check() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.options.callback();

      if (this.options.recursive) {
        this.check();
      }
    }, this.options.delay);
  }

  start() {
    this.check();
  }

  stop() {
    clearTimeout(this.timer);
  }
};
