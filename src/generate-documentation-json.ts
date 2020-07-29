import * as RCOpenApi from '@benjd90/routing-controllers-openapi';
import { createExpressServer, getMetadataArgsStorage } from '@flyacts/routing-controllers';
import * as appRootDir from 'app-root-dir';
import { getFromContainer, MetadataStorage } from 'class-validator';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import * as fs from 'fs';
import * as oa from 'openapi3-ts';
import { join } from 'path';
import { N9NodeRouting } from './models/routing.models';
import { applyDefaultValuesOnOptions } from './options';
import { getEnvironment } from './utils';

export function generateDocumentationJson(
	options: N9NodeRouting.Options,
	serverAlreadyStarted: boolean = true,
): object {
	const environment = getEnvironment();
	applyDefaultValuesOnOptions(options, environment);

	const packageJson = require(join(appRootDir.get(), 'package.json'));
	const baseOpenApiSpec: Partial<oa.OpenAPIObject> = {
		info: {
			description: packageJson.description,
			title: packageJson.name,
			version: packageJson.version,
		},
	};
	if (!serverAlreadyStarted) {
		createExpressServer(options.http.routingController);
	}

	const routesStorage = getMetadataArgsStorage();
	const validationMetadatas = (getFromContainer(MetadataStorage) as any).validationMetadatas;

	const schemas = validationMetadatasToSchemas(validationMetadatas, {
		refPointerPrefix: '#/components/schemas',
	});
	const additionalProperties: any = Object.assign({}, { components: { schemas } }, baseOpenApiSpec);
	const spec = RCOpenApi.routingControllersToSpec(
		routesStorage as any,
		options.http.routingController,
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

export function generateDocumentationJsonToFile(options: N9NodeRouting.Options): void {
	if (options.openapi && options.openapi.isEnable) {
		const path = getDocumentationJsonPath(options);
		const spec = generateDocumentationJson(options, false);
		options.log.debug(`OpenAPI documentation generated. Saving to a file...`);
		fs.writeFileSync(path, JSON.stringify(spec, null, 2));
		options.log.info(`OpenAPI documentation generated at : ${path}`);
	}
}
