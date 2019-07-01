// import { N9Error } from '@neo9/n9-node-utils';
import { N9Error } from '@neo9/n9-node-utils';
import * as appRootDir from 'app-root-dir';
// import { getFromContainer, MetadataStorage } from 'class-validator';
import { Express, NextFunction, Request, Response } from 'express';
import { N9NodeRouting } from './models/routing.models';
import { join } from 'path';
// import * as SwaggerUi from 'swagger-ui-express';
import * as RoutesService from './routes.service';
//
async function def(expressApp: Express, options: N9NodeRouting.Options): Promise<void> {
	// Fetch application name
	const packageJson = require(join(appRootDir.get(), 'package.json'));
	// if (!options.openapi) {
	// 	options.openapi = {
	// 		isEnable: true,
	// 	};
	// }
// 	options.openapi.jsonUrl = options.openapi.jsonUrl || '/documentation.json';
// 	options.openapi.swaggerui = options.openapi.swaggerui || Object.assign({}, options.openapi.swaggerui, { swaggerUrl: '../documentation.json' });
//
	expressApp.get('/', (req: Request, res: Response, next: NextFunction) => {
		res.status(200).send(packageJson.name);
	});

	// Monitoring route
	expressApp.get('/ping', async (req: Request, res: Response, next: NextFunction) => {
		if (options.http.ping && options.http.ping.dbs) {
			for (const db of options.http.ping.dbs) {
				if (!await db.isConnected.bind(db.thisArg || this)()) {
					global.log.error(`[PING] Can't connect to ${db.name}`);
					res.status(500).send();
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
	});

	// Return app version
	expressApp.get('/version', (req: Request, res: Response, next: NextFunction) => {
		res.status(200).send(packageJson.version);
	});

	expressApp.get('/routes', (req: Request, res: Response, next: NextFunction) => {
		res.status(200).send(RoutesService.getRoutes());
	});
//
// 	if (options.openapi.isEnable) {
// 		expressApp.get(options.openapi.jsonUrl, (req: Request, res: Response) => {
// 			const baseOpenApiSpec: Partial<oa.OpenAPIObject> = {
// 				info: {
// 					description: packageJson.description,
// 					title: packageJson.name,
// 					version: packageJson.version,
// 				},
// 			};
// 			const routesStorage = getMetadataArgsStorage();
// 			const validationMetadatas = (getFromContainer(MetadataStorage) as any).validationMetadatas;
//
// 			const schemas = validationMetadatasToSchemas(validationMetadatas, {
// 				refPointerPrefix: '#/components/schemas',
// 			});
// 			const additionalProperties = Object.assign({}, { components: { schemas } }, baseOpenApiSpec);
//
// 			const spec = RCOpenApi.routingControllersToSpec(routesStorage, options.http.routingController, additionalProperties);
//
// 			res.header('Access-Control-Allow-Origin', '*');
// 			res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
// 			res.json(spec);
// 		});
//
// 		expressApp.use('/documentation', SwaggerUi.serve, SwaggerUi.setup(null, options.openapi.swaggerui));
// 	}
}

export default def;
// TODO : Add swagger definition
