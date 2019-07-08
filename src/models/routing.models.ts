import { N9Log } from '@neo9/n9-node-log';
import { Type } from '@nestjs/common';
import { ValidatorOptions } from 'class-validator';
import { Express } from 'express';
import { Server } from 'http';
import * as morgan from 'morgan';

// tslint:disable-next-line:no-namespace
export namespace N9NodeRouting {

	export interface PingDb {
		name: string;
		isConnected: () => boolean | Promise<boolean>;
		thisArg?: any;
	}

	export interface HttpOptions {
		nest?: {
			controllers?: Type<any>[];
			providers?: Type<any>[];
		};
		ping?: {
			dbs?: PingDb[];
		};
		logLevel?: string | false | morgan.FormatFn;
		port?: number | string;
		preventListen?: boolean;
		validation?: ValidatorOptions;
		beforeRoutingControllerLaunchHook?: (app: Express, log: N9Log, options: Options) => Promise<void>;
		afterRoutingControllerLaunchHook?: (app: Express, log: N9Log, options: Options) => Promise<void>;
	}

	export type CallbacksBeforeShutdownFunction = ((log: N9Log) => Promise<void>);

	export interface CallbacksBeforeShutdown {
		function: CallbacksBeforeShutdownFunction;
		thisArg: any;
	}

	export interface ShutdownOptions {
		callbacksBeforeShutdown?: CallbacksBeforeShutdown[];
		waitDurationBeforeStop?: number;
		enableGracefulShutdown?: boolean;
		timeout?: number;
	}

	export interface JWTOptions {
		headerKey?: string;
		secret?: string;
		expiresIn?: number | string;
	}

	export interface Options {
		hasProxy?: boolean;
		enableRequestId?: boolean;
		enableLogFormatJSON?: boolean;
		path?: string;
		log?: N9Log;
		http?: HttpOptions;
		jwt?: JWTOptions;
		openapi?: SwaggerOptions;
		shutdown?: ShutdownOptions;
	}

	export interface SwaggerOptions {
		isEnable?: boolean;
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
