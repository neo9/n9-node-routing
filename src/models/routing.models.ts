import { RoutingControllersOptions } from '@flyacts/routing-controllers';
import { N9Log } from '@neo9/n9-node-log';
import { Express, Request, Response } from 'express';
import { Server } from 'http';
import * as morgan from 'morgan';

// tslint:disable-next-line:no-namespace
export namespace N9NodeRouting {
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
		prometheus?: PrometheusOptions;
		firstSequentialInitFileNames?: string[];
		firstSequentialStartFileNames?: string[];
	}

	export interface HttpOptions {
		ping?: {
			dbs?: PingDb[];
		};
		logLevel?: string | false | morgan.FormatFn;
		port?: number | string;
		preventListen?: boolean;
		routingController?: RoutingControllersOptions;
		beforeRoutingControllerLaunchHook?: (
			app: Express,
			log: N9Log,
			options: Options,
		) => Promise<void>;
		afterRoutingControllerLaunchHook?: (
			app: Express,
			log: N9Log,
			options: Options,
		) => Promise<void>;
	}

	export interface PingDb {
		name: string;
		isConnected: () => boolean | Promise<boolean>;
		thisArg?: any;
	}

	export interface JWTOptions {
		headerKey?: string;
		secret?: string;
		expiresIn?: number | string;
	}

	export interface SwaggerOptions {
		isEnable?: boolean;
		jsonUrl?: string;
		swaggerui?: SwaggerUi;
	}

	export interface SwaggerUi {
		customCss?: string;
		customJs?: string;
		swaggerUrl?: string;
	}

	export interface ShutdownOptions {
		callbacksBeforeShutdown?: CallbacksBeforeShutdown[];
		waitDurationBeforeStop?: number;
		enableGracefulShutdown?: boolean;
		timeout?: number;
	}

	export interface CallbacksBeforeShutdown {
		function: CallbacksBeforeShutdownFunction;
		thisArg: any;
	}

	export type CallbacksBeforeShutdownFunction = (log: N9Log) => Promise<void>;

	export interface PrometheusOptions {
		port?: number;
		labels?: string[];
		getLabelValues?: (req: Request, res: Response) => { [label: string]: string };
		accuracies?: string[];
		skip?: (req: Request, res: Response, labels: string[]) => boolean;
	}

	export interface ReturnObject {
		app: Express;
		server: Server;
		prometheusServer: Server;
	}
}
