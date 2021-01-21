import { createMiddleware, signalIsUp } from '@promster/express';
import * as PromsterServer from '@promster/server';
import * as appRootDir from 'app-root-dir';
import ErrnoException = NodeJS.ErrnoException;
import * as ClassValidator from 'class-validator';
import * as express from 'express';
import fastSafeStringify from 'fast-safe-stringify';
import * as helmet from 'helmet';
import { createServer } from 'http';
import * as morgan from 'morgan';
import { join } from 'path';
import * as PrometheusClient from 'prom-client';
import * as RoutingControllers from 'routing-controllers';
import { Container } from 'typedi';
import { N9NodeRouting } from './models/routing.models';
import { setRequestContext } from './requestid';

export default async (options: N9NodeRouting.Options): Promise<N9NodeRouting.ReturnObject> => {
	// Setup routing-controllers to use typedi container.
	RoutingControllers.useContainer(Container);
	ClassValidator.useContainer(Container);

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
		options.log.info(`Listening on port ${options.http.port}`);
		if (options.prometheus) {
			signalIsUp();
		}
	};

	// Create HTTP server
	let expressApp = express();
	let prometheusServer;

	// Middleware
	expressApp.use(setRequestContext);
	expressApp.use(helmet());
	if (options.prometheus) {
		expressApp.use(
			createMiddleware({
				options: {
					normalizePath: (
						path: string,
						rr: { req: express.Request; res: express.Response },
					): string => rr.req.route?.path || rr.req.originalUrl || rr.req.url,
					labels: options.prometheus.labels,
					getLabelValues: options.prometheus.getLabelValues,
					accuracies: options.prometheus.accuracies,
					skip: options.prometheus.skip,
				},
			}),
		);

		const packageJson = require(join(appRootDir.get(), 'package.json'));

		new PrometheusClient.Gauge({
			name: 'version_info',
			help: 'App version',
			labelNames: ['version'],
		}).set({ version: packageJson.version }, 1);

		prometheusServer = await PromsterServer.createServer({ port: options.prometheus.port });
	}
	// Logger middleware
	if (options.http.logLevel) {
		expressApp.use(
			morgan(options.http.logLevel as morgan.FormatFn, {
				stream: {
					write: (message) => {
						if ((global as any).n9NodeRoutingData.formatLogInJSON) {
							try {
								const morganDetails = JSON.parse(message);
								options.log.info(`api call ${morganDetails.path}`, morganDetails);
							} catch (e) {
								options.log.info(message?.replace('\n', ''), { errString: fastSafeStringify(e) });
							}
						} else {
							options.log.info(message?.replace('\n', ''));
						}
					},
				},
			}),
		);
	}

	const server = createServer(expressApp);

	if (options.http.beforeRoutingControllerLaunchHook) {
		await options.http.beforeRoutingControllerLaunchHook(expressApp, options.log, options);
	}

	expressApp = RoutingControllers.useExpressServer(expressApp, options.http.routingController);

	if (options.http.afterRoutingControllerLaunchHook) {
		await options.http.afterRoutingControllerLaunchHook(expressApp, options.log, options);
	}

	// Listen method
	const listen = async () => {
		return new Promise<void>((resolve, reject) => {
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
		server,
		prometheusServer,
		app: expressApp,
	};
};
