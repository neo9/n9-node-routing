import { N9Log } from '@neo9/n9-node-log';
import { waitFor } from '@neo9/n9-node-utils';
import { Server } from 'http';
import { N9NodeRouting } from './models/routing.models';

async function shutdown(logger: N9Log, shutdownOptions: N9NodeRouting.ShutdownOptions, server: Server): Promise<void> {
	setTimeout(() => {
		logger.error('shudown-timeout');
		process.exit(1);
	}, shutdownOptions.timeout);

	const waitDuration = shutdownOptions.waitDurationBeforeStop;
	// For Kubernetes downscale, let the DNS some time to dereference the pod IP
	logger.info(`Wait ${waitDuration} ms before exit`);
	await waitFor(waitDuration);

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

		logger.info(`Shudown SUCCESS`);
		process.exit(0);
	});
}

export function registerShutdown(logger: N9Log, shutdownOptions: N9NodeRouting.ShutdownOptions, server: Server): void {
	process.on('SIGTERM', async () => {
		logger.info('Got SIGTERM. Graceful shutdown start');
		await shutdown(logger, shutdownOptions, server);
	});

	process.on('SIGINT', async () => {
		logger.info('Got SIGINT. Graceful shutdown start');
		await shutdown(logger, shutdownOptions, server);
	});

	process.on('SIGUSR2', async () => {
		logger.info('Got SIGUSR2 (nodemon). Graceful shutdown start');
		await shutdown(logger, shutdownOptions, server);
	});
}
