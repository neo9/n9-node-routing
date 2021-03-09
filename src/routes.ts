import { N9Error } from '@neo9/n9-node-utils';
import { signalIsNotUp, signalIsUp } from '@promster/express';
import { Express, NextFunction, Request, Response } from 'express';
import * as fs from 'fs';
import * as SwaggerUi from 'swagger-ui-express';
import { PackageJson } from 'types-package-json';
import { generateDocumentationJson, getDocumentationJsonPath } from './generate-documentation-json';
import { N9NodeRouting } from './models/routing.models';
import * as RoutesService from './routes.service';

let shutdownAsked: boolean = false;

export function onShutdownAsked(): void {
	shutdownAsked = true;
}

export async function init(
	expressApp: Express,
	options: N9NodeRouting.Options,
	packageJson: PackageJson,
	env: 'development' | 'production' | string,
): Promise<void> {
	expressApp.get('/', (req: Request, res: Response, next: NextFunction) => {
		res.status(200).send(packageJson.name);
		next();
	});

	// Monitoring route
	expressApp.get('/ping', async (req: Request, res: Response, next: NextFunction) => {
		if (shutdownAsked) {
			res.status(503).send('server-shutting-down');
			signalIsNotUp();
			next();
			return;
		}
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
				const documentationJsonPath = getDocumentationJsonPath(options);
				if (fs.existsSync(documentationJsonPath)) {
					spec = JSON.parse(fs.readFileSync(documentationJsonPath).toString());
					options.log.debug(`Documentation fetched from file ${documentationJsonPath}`);
				} else {
					options.log.error(`Generated documentation not found from file ${documentationJsonPath}`);
					res.status(404).json(new N9Error('generated-documentation-not-found', 404));
					return;
				}
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
