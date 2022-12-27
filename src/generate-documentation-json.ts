// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';

import * as RoutingControllers from '@benjd90/routing-controllers';
import n9NodeConf from '@neo9/n9-node-conf';
import * as appRootDir from 'app-root-dir';
import * as ClassValidator from 'class-validator';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import * as fs from 'fs';
import type * as oa from 'openapi3-ts';
import { join } from 'path';
import * as RCOpenApi from 'routing-controllers-openapi';
import { Container } from 'typedi';
import type { PackageJson } from 'types-package-json';

import * as N9NodeRouting from './models/routing';
import { N9NodeConfOptions } from './models/routing';
import { applyDefaultValuesOnOptions, getLoadingConfOptions, mergeOptionsAndConf } from './options';
import { getEnvironment } from './utils';

export function generateDocumentationJson(
	n9NodeRoutingOptions: N9NodeRouting.Options,
	serverAlreadyStarted: boolean = true,
	defaultValuesAreAlreadySet: boolean = false,
	// eslint-disable-next-line global-require,import/no-dynamic-require
	packageJson: PackageJson = require(join(appRootDir.get(), 'package.json')),
): object {
	if (defaultValuesAreAlreadySet) {
		const environment = getEnvironment();
		applyDefaultValuesOnOptions(n9NodeRoutingOptions, environment, packageJson.name);
	}
	RoutingControllers.useContainer(Container);
	ClassValidator.useContainer(Container);
	Container.set('logger', n9NodeRoutingOptions.log);

	const baseOpenApiSpec: Partial<oa.OpenAPIObject> = {
		info: {
			description: packageJson.description,
			title: packageJson.name,
			version: packageJson.version,
		},
	};
	if (!serverAlreadyStarted) {
		Container.set('N9NodeRoutingOptions', n9NodeRoutingOptions);
		RoutingControllers.createExpressServer(n9NodeRoutingOptions.http.routingController);
	}

	const routesStorage = RoutingControllers.getMetadataArgsStorage();

	const schemas = validationMetadatasToSchemas({
		refPointerPrefix: '#/components/schemas/',
	});
	const additionalProperties: any = { components: { schemas }, ...baseOpenApiSpec };
	const spec = RCOpenApi.routingControllersToSpec(
		routesStorage as any,
		n9NodeRoutingOptions.http.routingController,
		additionalProperties,
	);

	return spec;
}

export function getDocumentationJsonPath(options: N9NodeRouting.Options): string {
	return (
		(options.openapi && options.openapi.jsonPath) ||
		join(appRootDir.get(), 'openapi-documentation.json')
	);
}

export function generateDocumentationJsonToFile(optionsParams: {
	path?: string;
	conf?: { n9NodeConf?: N9NodeConfOptions<N9NodeRouting.N9NodeRoutingBaseConf> };
}): string {
	const confOptions = getLoadingConfOptions(optionsParams);
	const conf: N9NodeRouting.N9NodeRoutingBaseConf = n9NodeConf(confOptions);
	// eslint-disable-next-line @typescript-eslint/no-var-requires,global-require,import/no-dynamic-require
	const packageJson = require(join(appRootDir.get(), 'package.json'));
	const environment = getEnvironment();
	const options: N9NodeRouting.Options<any> = mergeOptionsAndConf(
		optionsParams,
		conf.n9NodeRoutingOptions,
	);
	applyDefaultValuesOnOptions(options, environment, packageJson.name);

	if (options.openapi && options.openapi.isEnabled) {
		const path = getDocumentationJsonPath(options);
		const spec = generateDocumentationJson(options, false, true);
		options.log.debug(`OpenAPI documentation generated. Saving to a file...`);
		fs.writeFileSync(path, JSON.stringify(spec, null, 2));
		options.log.info(`OpenAPI documentation generated at : ${path}`);
		return path;
	}
}
