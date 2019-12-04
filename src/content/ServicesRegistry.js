import { Service } from './Service.js';
import * as StatusStrategies from './Status.Strategies.js';
import * as ControlStrategies from './Control.Strategies.js';

export const servicesRegistry = [
  {
    hosts: ['ted.com', 'facebook.com', 'kickstarter.com', 'music.youtube.com' ], // we can add support fields, like `host: string`, `hosts: Array<string>`
    options: {
      statusStrategy: StatusStrategies.oneOfTheVideosPlaying,
      controlStrategy: ControlStrategies.oneOfTheVideos
    }
  },
];

export function getService(domain) {
  const matchedService = servicesRegistry.find(serviceConfig => {
    return serviceConfig.host === domain
      || serviceConfig.hosts.includes(domain)
      || serviceConfig.hostPattern.match(domain);
  });

  if (!matchedService) {
    return;
  }

  return new Service(matchedService.options);
}
