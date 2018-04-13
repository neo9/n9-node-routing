import { N9Log } from '@neo9/n9-node-log';
import { Express } from 'express';
import { Server } from 'http';
import { RoutingControllersOptions } from 'routing-controllers';

// tslint:disable-next-line:no-namespace
export namespace RoutingControllerWrapper {

	export interface HttpOptions {
		logLevel?: string | false;
		port?: number | string;
		preventListen?: boolean;
		routingController?: RoutingControllersOptions;
		beforeRoutingControllerLaunchHook?: (app: Express, log: N9Log, options: Options) => Promise<void>;
		afterRoutingControllerLaunchHook?: (app: Express, log: N9Log, options: Options) => Promise<void>;
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

	export interface ReturnObject {
		app: Express;
		server: Server;
	}
}
