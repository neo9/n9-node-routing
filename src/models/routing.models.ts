import { N9Log } from '@neo9/n9-node-log';
import { Express } from 'express';
import { Server } from 'http';
import * as morgan from 'morgan';
import { RoutingControllersOptions } from 'routing-controllers';

// tslint:disable-next-line:no-namespace
export namespace N9NodeRouting {

	export interface HttpOptions {
		logLevel?: string | false | morgan.FormatFn;
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
		enableRequestId?: boolean;
		path?: string;
		log?: N9Log;
		http?: HttpOptions;
		jwt?: JWTOptions;
		openapi?: SwaggerOptions;
	}

	export interface SwaggerOptions {
		isEnable?: boolean;
		jsonUrl?: string;
		swaggerui?: SwaggerUi;
	}

	export interface ReturnObject {
		app: Express;
		server: Server;
	}

	export interface SwaggerUi {
		customCss?: string;
		customJs?: string;
		swaggerUrl?: string;
	}
}
