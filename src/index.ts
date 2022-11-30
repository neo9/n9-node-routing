import 'reflect-metadata';
import './utils/error-to-json';

import n9NodeConf from '@neo9/n9-node-conf';
import * as appRootDir from 'app-root-dir';
import * as Path from 'path';
import * as PrometheusClient from 'prom-client';
import { Container } from 'typedi';
import type { PackageJson } from 'types-package-json';

import * as ExpressApp from './express-app';
import { initAPM } from './init-apm';
import { validateConf } from './init-conf';
import initialiseModules from './initialise-modules';
import { N9NodeRouting } from './models/routing.models';
import { applyDefaultValuesOnOptions, mergeOptionsAndConf } from './options';
import { registerShutdown } from './register-system-signals';
import { requestIdFilter } from './requestid';
import * as Routes from './routes';
import startModules from './start-modules';
import { getEnvironment } from './utils';
import { N9HttpClient } from './utils/http-client-base';

/* istanbul ignore next */
function handleThrow(err: Error): void {
	throw err;
}
export * from '@benjd90/routing-controllers';

export { Inject, Service, Container } from 'typedi';

export { UseContainerOptions, getFromContainer, useContainer } from 'class-validator';
export * from 'class-validator';
export { Type, Transform, Exclude, Expose, classToPlain, plainToClass } from 'class-transformer';
export { getMetadataArgsStorage } from '@benjd90/routing-controllers';
export * from 'routing-controllers-openapi';
export * from '@neo9/n9-node-utils'; // allow users to use n9-node-utils without importing it specifically
export { N9Log } from '@neo9/n9-node-log';

export * from './decorators/acl.decorator';
export * from './validators/date-parser.validator';
export * from './models/routing.models';
export * from './models/routes.models';
export * from './utils/http-client-base';
export * from './utils/http-cargo-builder';
export * from './utils/cargo';

export { PrometheusClient };

// tslint:disable-next-line:cyclomatic-complexity
export default async (
	optionsParam: N9NodeRouting.Options = {},
): Promise<N9NodeRouting.ReturnObject> => {
	// Provides a stack trace for unhandled rejections instead of the default message string.
	process.on('unhandledRejection', handleThrow);
	// Options default
	const environment = getEnvironment();
	// eslint-disable-next-line @typescript-eslint/no-var-requires,global-require,import/no-dynamic-require
	const packageJson: PackageJson = require(Path.join(appRootDir.get(), 'package.json'));

	// Load project conf and logger & set as global
	const conf = n9NodeConf(optionsParam.conf.n9NodeConf);
	const options: N9NodeRouting.Options = mergeOptionsAndConf(optionsParam, conf?.n9NodeRouting);
	applyDefaultValuesOnOptions(options, environment, packageJson.name);
	const logger = options.log;
	(global as any).log = options.log;

	logger.info(`Conf loaded: ${conf.env}`);

	// Profile startup boot time
	logger.profile('startup');

	if (options.enableRequestId) {
		options.log.addFilter(requestIdFilter);
	}

	await validateConf(conf, options.conf.validation, logger);
	(global as any).conf = conf;

	Container.set('logger', logger);
	Container.set('conf', conf);
	Container.set('N9HttpClient', new N9HttpClient());
	Container.set('N9NodeRoutingOptions', options);

	if (options.apm) {
		initAPM(options.apm, logger);
	}

	// Execute all *.init.ts files in modules before app started listening on the HTTP Port
	await initialiseModules(options.path, logger, options.firstSequentialInitFileNames);
	const returnObject = await ExpressApp.init(options, packageJson, logger, conf);
	Routes.init(returnObject.app, options, packageJson, environment);

	// Manage SIGTERM & SIGINT
	if (options.shutdown.enableGracefulShutdown) {
		registerShutdown(logger, options.shutdown, returnObject.server);
	}

	// Execute all *.started.ts files in modules after app started listening on the HTTP Port
	await startModules(options.path, logger, options.firstSequentialStartFileNames);

	logger.profile('startup');
	return returnObject;
};
