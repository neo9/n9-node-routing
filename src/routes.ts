import * as RCOpenApi from '@benjd90/routing-controllers-openapi';
import { getMetadataArgsStorage } from '@flyacts/routing-controllers';
import { N9Error } from '@neo9/n9-node-utils';
import { signalIsNotUp } from '@promster/express';
import * as appRootDir from 'app-root-dir';
import { getFromContainer, MetadataStorage } from 'class-validator';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import { Express, NextFunction, Request, Response } from 'express';
import * as oa from 'openapi3-ts';
import { join } from 'path';
import * as SwaggerUi from 'swagger-ui-express';
import { N9NodeRouting } from './models/routing.models';
import * as RoutesService from './routes.service';

async function def(expressApp: Express, options: N9NodeRouting.Options): Promise<void> {
	// Fetch application name
	const packageJson = require(join(appRootDir.get(), 'package.json'));
	if (!options.openapi) {
		options.openapi = {
			isEnable: true,
		};
	}
	options.openapi.jsonUrl = options.openapi.jsonUrl || '/documentation.json';
	options.openapi.swaggerui = options.openapi.swaggerui || Object.assign({}, options.openapi.swaggerui, { swaggerUrl: '../documentation.json' });

	expressApp.get('/', (req: Request, res: Response, next: NextFunction) => {
		res.status(200).send(packageJson.name);
		next();
	});

	// Monitoring route
	expressApp.get('/ping', async (req: Request, res: Response, next: NextFunction) => {
		if (options.http.ping && options.http.ping.dbs) {
			for (const db of options.http.ping.dbs) {
				if (!await db.isConnected.bind(db.thisArg || this)()) {
					global.log.error(`[PING] Can't connect to ${db.name}`);
					res.status(500).send();
					if (options.prometheus) {
						signalIsNotUp();
					}
					next();
					return;
				}
			}
			res.status(200).send('pong-dbs-' + options.http.ping.dbs.length);
		} else if (global.db && global.dbClient) {
			if (!global.dbClient.isConnected()) {
				if (global.log && global.log.error) {
					global.log.error(`[PING] Can't connect to MongoDB`);
				}
				res.status(500).send();
			} else {
				res.status(200).send('pong-db');
			}
		} else {
			res.status(200).send('pong');
		}
		next();
	});

	// Return app version
	expressApp.get('/version', (req: Request, res: Response, next: NextFunction) => {
		res.status(200).send(packageJson.version);
		next();
	});

	expressApp.get('/routes', (req: Request, res: Response, next: NextFunction) => {
		res.status(200).send(RoutesService.getRoutes());
		next();
	});

	if (options.openapi.isEnable) {
		expressApp.get(options.openapi.jsonUrl, (req: Request, res: Response) => {
			const baseOpenApiSpec: Partial<oa.OpenAPIObject> = {
				info: {
					description: packageJson.description,
					title: packageJson.name,
					version: packageJson.version,
				},
			};
			const routesStorage = getMetadataArgsStorage();
			const validationMetadatas = (getFromContainer(MetadataStorage) as any).validationMetadatas;

			const schemas = validationMetadatasToSchemas(validationMetadatas, {
				refPointerPrefix: '#/components/schemas',
			});
			const additionalProperties = Object.assign({}, { components: { schemas } }, baseOpenApiSpec);

			const spec = RCOpenApi.routingControllersToSpec(routesStorage as any, options.http.routingController, additionalProperties);

			res.header('Access-Control-Allow-Origin', '*');
			res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
			res.json(spec);
		});

		expressApp.use('/documentation', SwaggerUi.serve, SwaggerUi.setup(null, options.openapi.swaggerui));
	}

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
				error,
			});
		}
		next();
	});
}

export default def;
