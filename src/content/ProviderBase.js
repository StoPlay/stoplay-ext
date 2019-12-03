/* Provider prototype */
export class ProviderBase {
  static get host() {
    throw new Error('host is not defined');
  }

  static checkStatus() {
    throw new Error('checkStatus not implemented');
  }

  static start() {
    throw new Error('start not implemented');
  }

  static pause() {
    throw new Error('pause not implemented');
  }

  static getTitle() {
    return '';
  }

}
