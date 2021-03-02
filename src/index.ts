import n9NodeLog from '@neo9/n9-node-log';
import * as appRootDir from 'app-root-dir';
import * as Path from 'path';
import * as PrometheusClient from 'prom-client';
// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';
import { Container } from 'typedi';
import { PackageJson } from 'types-package-json';
import * as ExpressApp from './express-app';
import initialiseModules from './initialise-modules';
import { N9NodeRouting } from './models/routing.models';
import { applyDefaultValuesOnOptions } from './options';
import { registerShutdown } from './register-system-signals';
import { requestIdFilter } from './requestid';
import * as Routes from './routes';
import startModules from './start-modules';
import { getEnvironment } from './utils';
// tslint:disable-next-line:no-import-side-effect
import './utils/error-to-json';
import { N9HttpClient } from './utils/http-client-base';

/* istanbul ignore next */
function handleThrow(err: Error): void {
	throw err;
}

export * from 'class-validator';
export { getMetadataArgsStorage } from 'routing-controllers';
export * from 'routing-controllers-openapi';

export * from './decorators/acl.decorator';
export * from './validators/date-parser.validator';
export * from './models/routing.models';
export * from './models/routes.models';
export * from './utils/http-client-base';
export * from './utils/http-cargo-builder';
export * from './utils/cargo';

export { PrometheusClient };

// tslint:disable-next-line:cyclomatic-complexity
export default async (options: N9NodeRouting.Options = {}): Promise<N9NodeRouting.ReturnObject> => {
	// Provides a stack trace for unhandled rejections instead of the default message string.
	process.on('unhandledRejection', handleThrow);
	// Options default
	const environment = getEnvironment();
	applyDefaultValuesOnOptions(options, environment);

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

	if (options.enableRequestId) {
		options.log.addFilter(requestIdFilter);
	}

	if (!(global as any).log) {
		(global as any).log = options.log;
	}

	Container.set('logger', options.log);
	if ((global as any).conf) {
		Container.set('conf', (global as any).conf);
	}
	Container.set('N9HttpClient', new N9HttpClient());

	const packageJson: PackageJson = require(Path.join(appRootDir.get(), 'package.json'));

	// Execute all *.init.ts files in modules before app started listening on the HTTP Port
	await initialiseModules(options.path, options.log, options.firstSequentialInitFileNames);
	const returnObject = await ExpressApp.init(options, packageJson);
	await Routes.init(returnObject.app, options, packageJson, environment);

	// Manage SIGTERM & SIGINT
	if (options.shutdown.enableGracefulShutdown) {
		registerShutdown(options.log, options.shutdown, returnObject.server);
	}

	// Execute all *.started.ts files in modules after app started listening on the HTTP Port
	await startModules(options.path, options.log, options.firstSequentialStartFileNames);

	return returnObject;
};
