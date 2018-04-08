import { Express } from 'express';
import * as express from 'express';
import * as helmet from 'helmet';
import { createServer } from 'http';
import * as morgan from 'morgan';
import { RoutingControllersOptions, useContainer, useExpressServer } from 'routing-controllers';
import { Container } from 'typedi';
import { CustomErrorHandler } from './error-handler.interceptor';
import { RoutingControllerWrapper } from './options.models';
import ErrnoException = NodeJS.ErrnoException;

export default async function (options: RoutingControllerWrapper.Options): Promise<Express> {
	// Setup routing-controllers to use typedi container.
	useContainer(Container);

	// Defaults options for routing-controller
	const defaultRoutingControllerOptions: RoutingControllersOptions = {
		defaults: {
			//with this option, null will return 404 by default
			nullResultCode: 404,
			//with this option, void or Promise<void> will return 204 by default
			undefinedResultCode: 204,
		},
		defaultErrorHandler: false,
		controllers: [options.path + "/**/*.controller.*s"],
	};

	// Default options
	options.http = options.http || {};
	options.http.port = options.http.port || process.env.PORT || 5000;
	options.http.logLevel = (typeof options.http.logLevel !== 'undefined' ? options.http.logLevel : 'dev');
	options.http.routingController = options.http.routingController || defaultRoutingControllerOptions;

	options.http.routingController.interceptors = [CustomErrorHandler];


	// Listeners
	const analyzeError = (error: ErrnoException) => {
		/* istanbul ignore if */
		if (error.syscall !== 'listen') {
			return error;
		}
		// handle specific listen errors with friendly messages
		switch (error.code) {
			case 'EACCES':
				return new Error(`Port ${options.http.port} requires elevated privileges`);
			case 'EADDRINUSE':
				return new Error(`Port ${options.http.port} is already in use`);
				/* istanbul ignore next */
			default:
				return error;
		}
	};
	const onListening = () => {
		options.log.info('Listening on port ' + options.http.port);
	};


	global.routes = [];

	// Create HTTP server
	let expressApp = express();

	// Middleware
	expressApp.use(helmet());
	// Logger middleware
	if (typeof options.http.logLevel === 'string') {
		expressApp.use(morgan(options.http.logLevel, { stream: options.log.stream }));
	}

	const server = createServer(expressApp);

	expressApp = useExpressServer(expressApp, options.http.routingController);

	// Listen method
	const listen = () => {
		return new Promise((resolve, reject) => {
			server.listen(options.http.port);
			server.on('error', (error: ErrnoException) => {
				reject(analyzeError(error));
			});
			server.on('listening', () => {
				onListening();
				resolve();
			});
		});
	};

	// Make the server listen
	if (!options.http.preventListen) await listen();
	return expressApp;
};
