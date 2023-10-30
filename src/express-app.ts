import { createServer } from 'node:http';

import { N9Log, safeStringify } from '@neo9/n9-node-log';
import { N9Error } from '@neo9/n9-node-utils';
import { createMiddleware, signalIsUp } from '@promster/express';
import * as PromsterServer from '@promster/server';
import * as Sentry from '@sentry/node';
import type { Integration } from '@sentry/types';
import * as ClassValidator from 'class-validator';
import * as express from 'express';
import helmet from 'helmet';
import * as morgan from 'morgan';
import * as PrometheusClient from 'prom-client';
import * as RoutingControllers from 'routing-controllers';
import { Container } from 'typedi';
import type { PackageJson } from 'types-package-json';

import * as N9NodeRouting from './models/routing';
import { setRequestContext } from './requestid';
import { isPortAvailable } from './utils';
import ErrnoException = NodeJS.ErrnoException;

export async function init<ConfType extends N9NodeRouting.N9NodeRoutingBaseConf>(
	options: N9NodeRouting.Options<ConfType>,
	packageJson: PackageJson,
	log: N9Log,
	conf: ConfType,
): Promise<N9NodeRouting.ReturnObject<ConfType>> {
	// Setup routing-controllers to use typedi container.
	RoutingControllers.useContainer(Container);
	ClassValidator.useContainer(Container);

	// Listeners
	const analyzeError = (error: ErrnoException): ErrnoException => {
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
	const onListening = (): void => {
		options.log.info(`Listening on port ${options.http.port}`);
		if (options.prometheus.isEnabled) {
			signalIsUp();
		}
	};

	// Create HTTP server
	let expressApp = express();
	let prometheusServer;

	if (options.sentry) {
		const initOptions: Sentry.NodeOptions = {
			release: packageJson.version,
			...options.sentry.initOptions,
		};
		if (options.sentry.additionalIntegrations?.length) {
			initOptions.integrations = initOptions.integrations || [];
			for (const additionalIntegration of options.sentry.additionalIntegrations) {
				if (additionalIntegration.kind === 'tracing') {
					(initOptions.integrations as Integration[]).push(
						new Sentry.Integrations.Express({
							// to trace all requests to the default router
							app: expressApp,
							methods: additionalIntegration.options?.methods,
						}),
					);
				}
			}
		}
		if (options.log.isLevelEnabled('debug')) {
			const initOptionsCopy = { ...initOptions };
			delete initOptionsCopy.dsn;
			options.log.debug(`Sentry conf`, initOptionsCopy);
		}
		Sentry.init(initOptions);
	}

	// Middleware
	expressApp.use(setRequestContext);
	expressApp.use(helmet());
	if (options.prometheus.isEnabled) {
		expressApp.use(
			createMiddleware({
				options: {
					normalizePath: (path: string, context: { req: any; res: any }): string =>
						context.req.route?.path || context.req.originalUrl || context.req.url,
					labels: options.prometheus.labels,
					getLabelValues: options.prometheus.getLabelValues,
					skip: options.prometheus.skip,
				},
			}),
		);

		new PrometheusClient.Gauge({
			name: 'version_info',
			help: 'App version',
			labelNames: ['version', 'name'],
		}).set({ version: packageJson.version, name: packageJson.name }, 1);

		if (!(await isPortAvailable(options.prometheus.port))) {
			throw new N9Error('prometheus-server-port-unavailable', 500, {
				port: options.prometheus.port,
			});
		}
		prometheusServer = await PromsterServer.createServer({ port: options.prometheus.port });
	}
	// Logger middleware
	if (options.http.logLevel) {
		expressApp.use(
			morgan(options.http.logLevel as morgan.FormatFn, {
				stream: {
					write: (message) => {
						if (options.log.formatJSON) {
							try {
								const morganDetails = JSON.parse(message);
								options.log.info(`api call ${morganDetails.path}`, morganDetails);
							} catch (e) {
								options.log.info(message?.replace('\n', ''), { errString: safeStringify(e) });
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
		await options.http.beforeRoutingControllerLaunchHook({
			expressApp,
			log: log.module('before-hook'),
			options,
			conf,
		});
	}
	expressApp.use(express.json(options.http.bodyParser));

	expressApp = RoutingControllers.useExpressServer(expressApp, options.http.routingController);

	if (options.http.afterRoutingControllerLaunchHook) {
		await options.http.afterRoutingControllerLaunchHook({
			expressApp,
			log: log.module('after-hook'),
			options,
			conf,
		});
	}

	// Listen method
	const listen = async (): Promise<void> => {
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
		conf,
		app: expressApp,
		logger: log,
	};
}
