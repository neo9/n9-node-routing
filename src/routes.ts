import { N9Error } from '@neo9/n9-node-utils';
import { signalIsNotUp, signalIsUp } from '@promster/express';
import * as appRootDir from 'app-root-dir';
import { Express, NextFunction, Request, Response } from 'express';
import * as _ from 'lodash';
import { join } from 'path';
import * as SwaggerUi from 'swagger-ui-express';
import { generateDocumentationJson, getDocumentationJsonPath } from './generate-documentation-json';
import { N9NodeRouting } from './models/routing.models';
import * as RoutesService from './routes.service';

async function def(
	expressApp: Express,
	options: N9NodeRouting.Options,
	env: 'development' | 'production' | string,
): Promise<void> {
	// Fetch application name
	const packageJson = require(join(appRootDir.get(), 'package.json'));
	if (!options.openapi) {
		options.openapi = {
			isEnable: true,
		};
	}
	options.openapi.jsonUrl = options.openapi.jsonUrl || '/documentation.json';
	options.openapi.swaggerui =
		options.openapi.swaggerui ||
		Object.assign({}, options.openapi.swaggerui, { swaggerUrl: '../documentation.json' });
	options.openapi.generateDocumentationOnTheFly = _.isBoolean(
		options.openapi.generateDocumentationOnTheFly,
	)
		? options.openapi.generateDocumentationOnTheFly
		: env === 'development';

	expressApp.get('/', (req: Request, res: Response, next: NextFunction) => {
		res.status(200).send(packageJson.name);
		next();
	});

	// Monitoring route
	expressApp.get('/ping', async (req: Request, res: Response, next: NextFunction) => {
		if (options.http.ping?.dbs) {
			for (const db of options.http.ping.dbs) {
				if (!(await db.isConnected.bind(db.thisArg || this)())) {
					(global as any).log.error(`[PING] Can't connect to ${db.name}`);
					res.status(500).send(`db-${db.name}-unreachable`);
					if (options.prometheus) {
						signalIsNotUp();
					}
					next();
					return;
				}
			}
			if (options.prometheus) {
				signalIsUp();
			}
			res.status(200).send(`pong-dbs-${options.http.ping.dbs.length}`);
		} else if ((global as any).db && (global as any).dbClient) {
			if (!(global as any).dbClient.isConnected()) {
				if ((global as any).log?.error) {
					(global as any).log.error(`[PING] Can't connect to MongoDB`);
				}
				if (options.prometheus) {
					signalIsNotUp();
				}
				res.status(500).send('db-unreachable');
			} else {
				if (options.prometheus) {
					signalIsUp();
				}
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

	if (options.openapi.isEnable && env !== 'production') {
		expressApp.get(options.openapi.jsonUrl, (req: Request, res: Response) => {
			let spec: object;
			if (options.openapi.generateDocumentationOnTheFly) {
				spec = generateDocumentationJson(options);
			} else {
				spec = require(getDocumentationJsonPath(options));
			}
			res.header('Access-Control-Allow-Origin', '*');
			res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
			res.json(spec);
		});

		expressApp.use(
			'/documentation',
			SwaggerUi.serve,
			SwaggerUi.setup(null, options.openapi.swaggerui),
		);
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
				error,
				code: err.message,
				status: err.status,
				context: err.context,
			});
		}
		next();
	});
}

export default def;
