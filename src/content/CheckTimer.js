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

    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
  }

  start() {
    let _this = this;
    let check = function() {
      clearTimeout(_this.timer);
      _this.timer = setTimeout(function() {
        _this.options.callback();

        if (_this.options.recursive) {
          check();
        }
      }, _this.options.delay);
    }
    check();
  }

  stop() {
    clearTimeout(this.timer);
  }
};