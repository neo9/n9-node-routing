import * as RoutingControllers from '@benjd90/routing-controllers';
import { N9Log } from '@neo9/n9-node-log';
import * as appRootDir from 'app-root-dir';
import * as ClassValidator from 'class-validator';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import * as fs from 'fs';
import * as oa from 'openapi3-ts';
import { join } from 'path';
import * as RCOpenApi from 'routing-controllers-openapi';
import { Container } from 'typedi';
import { N9NodeRouting } from './models/routing.models';
import { applyDefaultValuesOnOptions } from './options';
import { getEnvironment } from './utils';

export function generateDocumentationJson(
	n9NodeRoutingOptions: N9NodeRouting.Options,
	serverAlreadyStarted: boolean = true,
	defaultValuesAreAlreadySet: boolean = false,
): object {
	if (defaultValuesAreAlreadySet) {
		const environment = getEnvironment();
		applyDefaultValuesOnOptions(n9NodeRoutingOptions, environment);
	}
	RoutingControllers.useContainer(Container);
	ClassValidator.useContainer(Container);
	Container.set('logger', n9NodeRoutingOptions.log || new N9Log('generate-documentation'));

	const packageJson = require(join(appRootDir.get(), 'package.json'));
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
		refPointerPrefix: '#/components/schemas',
	});
	const additionalProperties: any = Object.assign({}, { components: { schemas } }, baseOpenApiSpec);
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

export function generateDocumentationJsonToFile(options: N9NodeRouting.Options): string {
	const environment = getEnvironment();
	applyDefaultValuesOnOptions(options, environment);

	if (options.openapi && options.openapi.isEnable) {
		const path = getDocumentationJsonPath(options);
		const spec = generateDocumentationJson(options, false, true);
		options.log.debug(`OpenAPI documentation generated. Saving to a file...`);
		fs.writeFileSync(path, JSON.stringify(spec, null, 2));
		options.log.info(`OpenAPI documentation generated at : ${path}`);
		return path;
	}
}
