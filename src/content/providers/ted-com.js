/* Provider prototype */
import {ProviderBase} from '../ProviderBase.js';
import * as mixin from '../mixins/oneOfTheVideos.js';

export class ProviderTedCom extends ProviderBase {

  static get host() {
    return 'ted.com';
  }

  static checkStatus() {
    return mixin.checkStatus();
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
