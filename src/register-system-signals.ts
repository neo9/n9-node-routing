import { N9Log } from '@neo9/n9-node-log';
import { Server } from 'http';
import { N9NodeRouting } from './models/routing.models';

function shutdown(logger: N9Log, shutdownOptions: N9NodeRouting.ShutdownOptions, server: Server): void {
	server.close(async (error) => {
		if (error) {
			logger.error('can-not-shutdown-gracefully', { error });
			process.exit(1);
		}

		if (global.dbClient) {
			const dbClient = global.dbClient;
			logger.info('Closing db connections');
			if (dbClient.close) {
				await dbClient.close();
			} else {
				logger.warn(`Can't close db connection, close function is not present`);
			}
			logger.debug('End closing db connections');
		}

		setTimeout(() => {
			logger.error('shudown-timeout');
			process.exit(1);
		});
	});
}

export function registerSuhtdown(logger: N9Log, shutdownOptions: N9NodeRouting.ShutdownOptions, server: Server): void {
	process.on('SIGTERM', () => {
		logger.info('Got SIGTERM. Graceful shutdown start');
		shutdown(logger, shutdownOptions, server);
	});

	process.on('SIGINT', () => {
		logger.info('Got SIGINT. Graceful shutdown start');
		shutdown(logger, shutdownOptions, server);
	});

	process.on('SIGUSR2', () => {
		logger.info('Got SIGUSR2 (nodemon). Graceful shutdown start');
		shutdown(logger, shutdownOptions, server);
	});
}
