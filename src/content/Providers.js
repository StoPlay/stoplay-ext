/* providers list and retrieval

  */

import { ProviderTedCom } from './providers/ted-com.js';

/* returns object of host: path-to-provider-class */
export const Providers = () => {
  let list = {};
  [
    ProviderTedCom
  ].forEach((provider) => {
    list[provider.host] = provider;
  });
  return list;
}

/* return a certain provider class */
export const GetProvider = (host) => {
  return Providers()[host];
}
