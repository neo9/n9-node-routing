import { N9Error } from '@neo9/n9-node-utils';
import * as appRootDir from 'app-root-dir';
import { getFromContainer, MetadataStorage } from 'class-validator';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import { Express, NextFunction, Request, Response } from 'express';
import { join } from 'path';
import { getMetadataArgsStorage } from 'routing-controllers';
import * as RCOpenApi from 'routing-controllers-openapi';
import { N9NodeRouting } from './models/routing.models';
import * as RoutesService from './routes.service';
import * as oa from 'openapi3-ts';
import * as SwaggerUi from 'swagger-ui-express';

export default async function(expressApp: Express, options: N9NodeRouting.Options): Promise<void> {
	// Fetch application name
	const packageJson = require(join(appRootDir.get(), 'package.json'));

	expressApp.get('/', (req: Request, res: Response) => {
		res.status(200).send(packageJson.name);
	});

	// Monitoring route
	expressApp.get('/ping', (req: Request, res: Response) => {
		res.status(200).send('pong');
	});

	expressApp.get('/routes', (req: Request, res: Response) => {
		res.status(200).send(RoutesService.getRoutes());
	});

	expressApp.get((options.swaggerui && options.swaggerui.swaggerUrl) || '/documentation.json', (req: Request, res: Response) => {
		const baseOpenApiSpec: Partial<oa.OpenAPIObject> = {
			info: {
				description: packageJson.description,
				title: packageJson.name,
				version: packageJson.version
			}
		};
		const routesStorage = getMetadataArgsStorage();
		const validationMetadatas = (getFromContainer(MetadataStorage) as any).validationMetadatas;

		const schemas = validationMetadatasToSchemas(validationMetadatas, {
			refPointerPrefix: '#/components/schemas'
		});
		const additionalProperties = Object.assign({}, {components: { schemas }}, baseOpenApiSpec);

		const spec = RCOpenApi.routingControllersToSpec(routesStorage, options.http.routingController, additionalProperties);

		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		res.json(spec);
	});

	expressApp.use('/documentation', SwaggerUi.serve, SwaggerUi.setup(null, Object.assign({}, options.swaggerui, {
		swaggerUrl: '/documentation.json',
	})));

	// Handle 404 errors
	expressApp.use((req: Request, res: Response, next: NextFunction) => {
		if (!res.headersSent) {
			const err = new N9Error('not-found', 404, { url: req.url });
			options.log.warn(err as any);
			let error;

			if (!expressApp.get('env') || ['development', 'test'].indexOf(expressApp.get('env')) !== -1) {
				error = err;
			}

			return res.status(404).json({
				code: err.message,
				status: err.status,
				context: err.context,
				error
			});
		}
	});
}
