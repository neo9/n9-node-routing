import { N9Error } from '@neo9/n9-node-utils';
import { signalIsNotUp, signalIsUp } from '@promster/express';
import { Express, NextFunction, Request, Response } from 'express';
import * as fs from 'fs';
import * as SwaggerUi from 'swagger-ui-express';
import type { PackageJson } from 'types-package-json';

import { generateDocumentationJson, getDocumentationJsonPath } from './generate-documentation-json';
import * as N9NodeRouting from './models/routing';
import * as RoutesService from './routes.service';

let shutdownAsked = false;

export function onShutdownAsked(): void {
	shutdownAsked = true;
}

export function init(
	expressApp: Express,
	options: N9NodeRouting.Options,
	packageJson: PackageJson,
	env: 'development' | 'production' | string,
): void {
	expressApp.get('/', (req: Request, res: Response, next: NextFunction) => {
		res.status(200).json({ apiName: packageJson.name });
		next();
	});

	// Monitoring route
	expressApp.get('/ping', async (req: Request, res: Response, next: NextFunction) => {
		if (shutdownAsked) {
			res.status(503).json({ response: 'server-shutting-down' });
			signalIsNotUp();
			next();
			return;
		}
		if (options.http.ping?.dbs) {
			for (const db of options.http.ping.dbs) {
				// eslint-disable-next-line @typescript-eslint/no-invalid-this
				if (!(await db.isConnected.bind(db.thisArg || this)())) {
					(global as any).log.error(`[PING] Can't connect to ${db.name}`);
					res.status(500).json(new N9Error(`db-${db.name}-unreachable`, 500));
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
			res.status(200).json({ response: `pong-dbs-${options.http.ping.dbs.length}` });
		} else if ((global as any).db && (global as any).dbClient) {
			if (!(global as any).dbClient.isConnected()) {
				if ((global as any).log?.error) {
					(global as any).log.error(`[PING] Can't connect to MongoDB`);
				}
				if (options.prometheus) {
					signalIsNotUp();
				}
				res.status(500).json(new N9Error('db-unreachable', 500));
			} else {
				if (options.prometheus) {
					signalIsUp();
				}
				res.status(200).json({ response: 'pong-db' });
			}
		} else {
			res.status(200).json({ response: 'pong' });
		}
		next();
	});

	// Return app version
	expressApp.get('/version', (req: Request, res: Response, next: NextFunction) => {
		res.status(200).json({ version: packageJson.version });
		next();
	});

	expressApp.get('/routes', (req: Request, res: Response, next: NextFunction) => {
		res.status(200).json(RoutesService.getRoutes());
		next();
	});

	if (options.openapi.isEnabled && env !== 'production') {
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
			options.log.warn(err.message, err);
			let error;

			if (!expressApp.get('env') || ['development', 'test'].includes(expressApp.get('env'))) {
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
