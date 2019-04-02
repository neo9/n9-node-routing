import { N9Log } from '@neo9/n9-node-log';
import { waitFor } from '@neo9/n9-node-utils';
import { Server } from 'http';
import { N9NodeRouting } from './models/routing.models';

async function shutdown(logger: N9Log, shutdownOptions: N9NodeRouting.ShutdownOptions, server: Server, signalReceived: string): Promise<void> {
	setTimeout(() => {
		logger.error('shudown-timeout');
		process.exit(1);
	}, shutdownOptions.timeout);

	const waitDuration = shutdownOptions.waitDurationBeforeStop;
	// For Kubernetes downscale, let the DNS some time to dereference the pod IP
	logger.info(`Wait ${waitDuration} ms before exit`);
	await waitFor(waitDuration);

	if (shutdownOptions.callbacksBeforeShutdown && shutdownOptions.callbacksBeforeShutdown.length) {
		logger.info(`Calling ${shutdownOptions.callbacksBeforeShutdown.length} callbacks`);
		for (const callbackSpec of shutdownOptions.callbacksBeforeShutdown) {
			await callbackSpec.function.bind(callbackSpec.thisArg)(logger);
		}
	}

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

		logger.info(`Shutdown SUCCESS`);
		process.kill(process.pid, signalReceived);
	});
}

export function registerShutdown(logger: N9Log, shutdownOptions: N9NodeRouting.ShutdownOptions, server: Server): void {
	process.once('SIGTERM', async () => {
		logger.info('Got SIGTERM. Graceful shutdown start');
		await shutdown(logger, shutdownOptions, server, 'SIGTERM');
	});

	process.once('SIGINT', async () => {
		logger.info('Got SIGINT. Graceful shutdown start');
		await shutdown(logger, shutdownOptions, server, 'SIGINT');
	});

	process.once('SIGUSR2', async () => {
		logger.info('Got SIGUSR2 (nodemon). Graceful shutdown start');
		await shutdown(logger, shutdownOptions, server, 'SIGUSR2');
	});
}
