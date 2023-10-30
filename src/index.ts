import 'reflect-metadata';
import './utils/error-to-json';

import * as Path from 'node:path';

import N9NodeConf from '@neo9/n9-node-conf';
import { N9Log } from '@neo9/n9-node-log';
import * as AppRootDir from 'app-root-dir';
import { instanceToPlain } from 'class-transformer';
import * as PrometheusClient from 'prom-client';
import { Container } from 'typedi';
import type { PackageJson } from 'types-package-json';

import * as ExpressApp from './express-app';
import { initAPM } from './init-apm';
import { validateConf } from './init-conf';
import InitialiseModules from './initialise-modules';
import * as N9NodeRouting from './models/routing';
import { applyDefaultValuesOnOptions, getLoadingConfOptions, mergeOptionsAndConf } from './options';
import { registerShutdown } from './register-system-signals';
import { requestIdFilter } from './requestid';
import * as Routes from './routes';
import { initExposedConf } from './routes';
import StartModules from './start-modules';
import { getEnvironment } from './utils';
import { N9HttpClient } from './utils/http-client-base';

/* istanbul ignore next */
function handleThrow(err: Error): void {
	throw err;
}
export * from 'routing-controllers';

export { Inject, Service, Container } from 'typedi';

export { UseContainerOptions, getFromContainer, useContainer } from 'class-validator';
export * from 'class-validator';
export {
	Type,
	Transform,
	Exclude,
	Expose,
	instanceToPlain,
	plainToInstance,
} from 'class-transformer';
export { getMetadataArgsStorage } from 'routing-controllers';
export * from 'routing-controllers-openapi';
export * from '@neo9/n9-node-utils'; // allow users to use n9-node-utils without importing it specifically
export { N9Log, safeStringify, removeColors } from '@neo9/n9-node-log';

export * from './decorators/acl.decorator';
export * from './validators';
export * from './transformer';
export * from './models/routes.models';
export * from './utils/http-client-base';
export * from './utils/http-cargo-builder';
export * from './utils/cargo';
export * from './generate-documentation-json';
export { ExtendConfigKeyFormat, N9ConfBaseConf } from '@neo9/n9-node-conf';

export * as N9NodeRouting from './models/routing';

export { PrometheusClient };

// tslint:disable-next-line:cyclomatic-complexity
export default async <
	ConfType extends N9NodeRouting.N9NodeRoutingBaseConf = N9NodeRouting.N9NodeRoutingBaseConf,
>(
	optionsParam: N9NodeRouting.Options<ConfType> = {},
): Promise<N9NodeRouting.ReturnObject<ConfType>> => {
	// Provides a stack trace for unhandled rejections instead of the default message string.
	process.on('unhandledRejection', handleThrow);
	// Options default
	const environment = getEnvironment();
	// eslint-disable-next-line @typescript-eslint/no-var-requires,global-require,import/no-dynamic-require
	const packageJson: PackageJson = require(Path.join(AppRootDir.get(), 'package.json'));

	let conf: ConfType = N9NodeConf(getLoadingConfOptions(optionsParam));
	const options: N9NodeRouting.Options<ConfType> = mergeOptionsAndConf(
		optionsParam,
		conf.n9NodeRoutingOptions,
	);
	applyDefaultValuesOnOptions(options, environment, packageJson.name);
	const logger = options.log;
	// print app infos
	const initialInfos = `${conf.name} version : ${conf.version} env: ${conf.env} node: ${process.version}`;
	logger.info('-'.repeat(initialInfos.length));
	logger.info(initialInfos);
	logger.info('-'.repeat(initialInfos.length));

	// Profile startup boot time
	logger.profile('startup');

	if (options.enableRequestId) {
		options.log.addFilter(requestIdFilter);
	}

	const confInstance: ConfType = await validateConf(conf, options.conf.validation, logger);
	conf = confInstance || conf;
	initExposedConf(instanceToPlain(conf));
	Container.set(N9Log, logger);
	if (options.conf.validation.classType) {
		Container.set(options.conf.validation.classType, conf);
	} else {
		Container.set('conf', conf);
	}
	Container.set(N9HttpClient, new N9HttpClient(logger, options.httpClient));
	Container.set(N9NodeRouting.Options, options);

	if (options.apm) {
		initAPM(options.apm, logger);
	}

	// Execute all *.init.ts files in modules before app started listening on the HTTP Port
	await InitialiseModules<ConfType>(
		options.path,
		logger,
		options.firstSequentialInitFileNames,
		conf,
	);
	const returnObject = await ExpressApp.init<ConfType>(options, packageJson, logger, conf);
	Routes.init(returnObject.app, options, packageJson, environment, logger);

	// Manage SIGTERM & SIGINT
	if (options.shutdown.enableGracefulShutdown) {
		registerShutdown(logger, options.shutdown, returnObject.server);
	}

	// Execute all *.started.ts files in modules after app started listening on the HTTP Port
	await StartModules<ConfType>(options.path, logger, options.firstSequentialStartFileNames, conf);

	logger.profile('startup');
	return returnObject;
};
