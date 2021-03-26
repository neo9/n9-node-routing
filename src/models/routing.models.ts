import { N9Log } from '@neo9/n9-node-log';
import * as Sentry from '@sentry/node';
import { RequestHandlerOptions } from '@sentry/node/dist/handlers';
import { Express, Request, Response } from 'express';
import { Server } from 'http';
import * as morgan from 'morgan';
import { RoutingControllersOptions } from 'routing-controllers';

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
		sentry?: SentryOptions;
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
		generateDocumentationOnTheFly?: boolean; // default true for dev only
		jsonUrl?: string;
		jsonPath?: string;
		swaggerui?: SwaggerUi;
	}

	export interface SwaggerUi {
		customCss?: string;
		customJs?: string;
		swaggerUrl?: string;
	}

	export interface ShutdownOptions {
		callbacksBeforeShutdown?: CallbacksBeforeShutdown[];
		callbacksOnShutdownSignalReceived?: CallbacksBeforeShutdown[];
		waitDurationBeforeStop?: number;
		enableGracefulShutdown?: boolean;
		timeout?: number;
	}

	export interface CallbacksBeforeShutdown {
		function: CallbacksBeforeShutdownFunction;
		thisArg: any;
		name?: string;
	}

	export type CallbacksBeforeShutdownFunction = (log: N9Log) => Promise<void>;

	export interface PrometheusOptions {
		port?: number;
		labels?: string[];
		getLabelValues?: (req: Request, res: Response) => { [label: string]: string };
		accuracies?: string[];
		skip?: (req: Request, res: Response, labels: string[]) => boolean;
	}

	export interface SentryOptions {
		initOptions?: Sentry.NodeOptions; // dsn can be provided through env variable
		forceCustomOptions?: boolean;
		additionalIntegrations?: SentryIntegrationTracingOption[];
		requestHandlerOptions?: RequestHandlerOptions;
		errorHandlerOptions?: {
			shouldHandleError?(error: MiddlewareError): boolean;
		};
	}

	/**
	 * Model of errors from Sentry
	 */
	export interface MiddlewareError extends Error {
		status?: number | string;
		statusCode?: number | string;
		status_code?: number | string;
		output?: {
			statusCode?: number | string;
		};
	}

	export interface SentryIntegrationOption {
		kind: string;
	}

	export interface SentryIntegrationTracingOption extends SentryIntegrationOption {
		kind: 'tracing';
		options?: {
			methods?: (
				| 'all'
				| 'get'
				| 'head'
				| 'post'
				| 'put'
				| 'delete'
				| 'options'
				| 'trace'
				| 'patch'
			)[];
		};
	}

	export interface ReturnObject {
		app: Express;
		server: Server;
		prometheusServer: Server;
	}
}
