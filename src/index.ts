import n9NodeLog from '@neo9/n9-node-log';
import * as appRootDir from 'app-root-dir';
import { join } from 'path';
import * as PrometheusClient from 'prom-client';
// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';
import { Container } from 'typedi';
import initialiseModules from './initialise-modules';
import { N9NodeRouting } from './models/routing.models';
import { registerShutdown } from './register-system-signals';
import { requestIdFilter } from './requestid';
import routes from './routes';
import startExpressApp from './start-express-app';
import startModules from './start-modules';
// tslint:disable-next-line:no-import-side-effect
import './utils/error-to-json';
import { N9HttpClient } from './utils/http-client-base';

/* istanbul ignore next */
function handleThrow(err: Error): void {
	throw err;
}

export * from 'class-validator';
export { getMetadataArgsStorage } from '@flyacts/routing-controllers';
export * from '@benjd90/routing-controllers-openapi';

export * from './decorators/acl.decorator';
export * from './validators/date-parser.validator';
export * from './models/routing.models';
export * from './models/routes.models';
export * from './utils/http-client-base';

export { PrometheusClient };

export default async (options: N9NodeRouting.Options = {}): Promise<N9NodeRouting.ReturnObject> => {
	// Provides a stack trace for unhandled rejections instead of the default message string.
	process.on('unhandledRejection', handleThrow);

	// Options default
	const developmentEnv = process.env.NODE_ENV && process.env.NODE_ENV === 'development';
	options.path = options.path || join(appRootDir.get(), 'src', 'modules');
	options.log = options.log || (global as any).log;
	options.hasProxy = typeof options.hasProxy === 'boolean' ? options.hasProxy : true;
	options.enableRequestId =
		typeof options.enableRequestId === 'boolean' ? options.enableRequestId : true;
	// If enableLogFormatJSON is provided, we use it's value.
	// Otherwise, we activate the plain logs for development env and JSON logs for other environments
	options.enableLogFormatJSON =
		typeof options.enableLogFormatJSON === 'boolean'
			? options.enableLogFormatJSON
			: !developmentEnv;
	options.shutdown = options.shutdown || {};
	options.shutdown.enableGracefulShutdown =
		typeof options.shutdown.enableGracefulShutdown === 'boolean'
			? options.shutdown.enableGracefulShutdown
			: true;
	options.shutdown.timeout =
		typeof options.shutdown.timeout === 'number' ? options.shutdown.timeout : 25 * 1_000;
	options.shutdown.waitDurationBeforeStop =
		typeof options.shutdown.waitDurationBeforeStop === 'number'
			? options.shutdown.waitDurationBeforeStop
			: 10_000;
	if (options.prometheus) {
		options.prometheus.port =
			typeof options.prometheus.port === 'number' ? options.prometheus.port : 9101;
		options.prometheus.accuracies = options.prometheus.accuracies || ['s'];
	}

	const formatLogInJSON = options.enableLogFormatJSON;
	(global as any).n9NodeRoutingData = {
		formatLogInJSON,
		options,
	};

	if ((global as any).log) {
		(global as any).log = n9NodeLog((global as any).log.name, {
			...(global as any).log.options,
			formatJSON: formatLogInJSON,
		});
	}

	// If log if given, add a namespace
	if (options.log) {
		options.log = options.log.module('n9-node-routing', {
			formatJSON: formatLogInJSON,
		});
	} else {
		options.log = n9NodeLog('n9-node-routing', {
			formatJSON: formatLogInJSON,
		});
	}
	if (options.enableRequestId) {
		options.log.addFilter(requestIdFilter);
	}

	Container.set('logger', options.log);
	if ((global as any).conf) {
		Container.set('conf', (global as any).conf);
	}
	Container.set('N9HttpClient', new N9HttpClient());

	// Execute all *.init.ts files in modules before app started listening on the HTTP Port
	await initialiseModules(options.path, options.log, options.firstSequentialInitFileNames);
	const returnObject = await startExpressApp(options);
	await routes(returnObject.app, options);

	// Manage SIGTERM & SIGINT
	if (options.shutdown.enableGracefulShutdown) {
		registerShutdown(options.log, options.shutdown, returnObject.server);
	}

	// Execute all *.started.ts files in modules after app started listening on the HTTP Port
	await startModules(options.path, options.log, options.firstSequentialStartFileNames);

	return returnObject;
};
