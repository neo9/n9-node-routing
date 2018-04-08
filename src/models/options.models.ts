import { N9Log } from '@neo9/n9-node-log';
import { RoutingControllersOptions } from 'routing-controllers';

// tslint:disable-next-line:no-namespace
export namespace RoutingControllerWrapper {

	export interface HttpOptions {
		logLevel?: string | false;
		port?: number | string;
		preventListen?: boolean;
		routingController?: RoutingControllersOptions;
	}

	export interface JWTOptions {
		headerKey?: string;
		secret?: string;
		expiresIn?: number | string;
	}

	export interface Options {
		hasProxy?: boolean;
		path?: string;
		log?: N9Log;
		http?: HttpOptions;
		jwt?: JWTOptions;
	}
}
