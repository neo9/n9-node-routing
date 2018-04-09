import { N9Error } from '@neo9/n9-node-utils';
import * as express from 'express';
import * as helmet from 'helmet';
import { createServer } from 'http';
import * as morgan from 'morgan';
import { Action, RoutingControllersOptions, useContainer, useExpressServer } from 'routing-controllers';
import { Container } from 'typedi';
import { ErrorHandler } from './middleware/error-handler.interceptor';
import { SessionLoaderInterceptor } from './middleware/session-loader.interceptor';
import { RoutingControllerWrapper } from './models/wrapper.models';
import ErrnoException = NodeJS.ErrnoException;

export default async function(options: RoutingControllerWrapper.Options): Promise<RoutingControllerWrapper.ReturnObject> {
	// Setup routing-controllers to use typedi container.
	useContainer(Container);

	// Defaults options for routing-controller
	const defaultRoutingControllerOptions: RoutingControllersOptions = {
		defaults: {
			// with this option, null will return 404 by default
			nullResultCode: 404,
			// with this option, void or Promise<void> will return 204 by default
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

	options.http.routingController.interceptors = [SessionLoaderInterceptor, ErrorHandler];
	options.http.routingController.authorizationChecker = async (action: Action, roles: string[]) => {
		if (!action.request.headers.session) {
			throw new N9Error('session-required', 401);
		}
		try {
			action.request.session = JSON.parse(action.request.headers.session);
		} catch (err) {
			throw new N9Error('session-header-is-invalid', 401);
		}
		if (!action.request.session.userId) {
			throw new N9Error('session-header-has-no-userId', 401);
		}
		return true;
	};
	options.http.routingController.validation = {
		whitelist: true,
		forbidNonWhitelisted: true
	};

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
	const listen = async () => {
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

	return {
		app: expressApp,
		server
	};
}
