import { N9Error } from '@neo9/n9-node-utils';
import * as appRootDir from 'app-root-dir';
import { Express, NextFunction, Request, Response } from 'express';
import { join } from 'path';
import { RoutingControllerWrapper } from './models/options.models';
import * as RoutesService from './routes.service';

export default async function(expressApp: Express, options: RoutingControllerWrapper.Options): Promise<void> {
	// Fetch application name
	const name = require(join(appRootDir.get(), 'package.json')).name;

	expressApp.get('/', (req: Request, res: Response) => {
		res.status(200).send(name);
	});

	// Monitoring route
	expressApp.get('/ping', (req: Request, res: Response) => {
		res.status(200).send('pong');
	});

	expressApp.get('/routes', (req: Request, res: Response) => {
		res.status(200).send(RoutesService.getRoutes());
	});
	// Handle 404 errors
	expressApp.use((req: Request, res: Response, next: NextFunction) => {
		if (!res.headersSent) {
			return res.status(404).json(new N9Error('not-found', 404, { url: req.url }));
		}
	});
}
