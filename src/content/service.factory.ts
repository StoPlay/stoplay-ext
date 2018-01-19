import {BaseService} from "./services/base.service";
import services from "./service.registry";

export class ServiceFactory {
    static getService(domain: string): BaseService {
        const service = services.find(row => row.domain === domain);

        if (service !== void 0) {
            return new service;
        }

        return;
    }
}
