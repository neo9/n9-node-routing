import * as RCOpenApi from '@benjd90/routing-controllers-openapi';
import { createExpressServer, getMetadataArgsStorage } from '@flyacts/routing-controllers';
import * as appRootDir from 'app-root-dir';
import { getFromContainer, MetadataStorage } from 'class-validator';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import * as fs from 'fs';
import * as oa from 'openapi3-ts';
import { join } from 'path';
import { N9NodeRouting } from './models/routing.models';

export function generateDocumentationJson(options: N9NodeRouting.Options): object {
	const packageJson = require(join(appRootDir.get(), 'package.json'));
	const baseOpenApiSpec: Partial<oa.OpenAPIObject> = {
		info: {
			description: packageJson.description,
			title: packageJson.name,
			version: packageJson.version,
		},
	};
	createExpressServer({
		defaults: {
			// with this option, null will return 404 by default
			nullResultCode: 404,
			// with this option, void or Promise<void> will return 204 by default
			undefinedResultCode: 204,
		},
		defaultErrorHandler: false,
		controllers: [`${join(appRootDir.get(), 'src', 'modules')}/**/*.controller.*s`],
	});

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
	return (options.openapi && options.openapi.jsonPath) || './documentation.json';
}

export function generateDocumentationJsonToFile(options: N9NodeRouting.Options): void {
	if (options.openapi && options.openapi.isEnable) {
		const path = getDocumentationJsonPath(options);
		const spec = generateDocumentationJson(options);
		fs.writeFileSync(path, JSON.stringify(spec, null, 2));
	}
}
