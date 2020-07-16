import { N9Log } from '@neo9/n9-node-log';
import { waitFor } from '@neo9/n9-node-utils';
import fastSafeStringify from 'fast-safe-stringify';
import { Server } from 'http';
import { N9NodeRouting } from './models/routing.models';

// istanbul ignore next
async function shutdown(
	logger: N9Log,
	shutdownOptions: N9NodeRouting.ShutdownOptions,
	server: Server,
): Promise<void> {
	setTimeout(() => {
		logger.error('shutdown-timeout');
		process.exit(1);
	}, shutdownOptions.timeout);
	const waitDuration = shutdownOptions.waitDurationBeforeStop;
	// For Kubernetes downscale, let the DNS some time to dereference the pod IP
	logger.info(`Wait ${waitDuration} ms before exit`);
	await waitFor(waitDuration);

	if (shutdownOptions.callbacksBeforeShutdown?.length) {
		logger.info(`Calling ${shutdownOptions.callbacksBeforeShutdown.length} callbacks`);
		for (const callbackSpec of shutdownOptions.callbacksBeforeShutdown) {
			await callbackSpec.function.bind(callbackSpec.thisArg)(logger);
		}
	}
	server.getConnections((error1, count) => {
		if (error1) {
			logger.error('can-not-get-number-of-connections', {
				errString: fastSafeStringify(error1),
				errMessage: error1.message,
			});
			process.exit(1);
		}
		logger.info(`Nb of connections before close : ${count}`);

		server.close(async (error2) => {
			if (error2) {
				logger.error('can-not-shutdown-gracefully', {
					errString: fastSafeStringify(error2),
					errMessage: error2.message,
				});
				process.exit(1);
			}

			if ((global as any).dbClient) {
				const dbClient = (global as any).dbClient;
				logger.info('Closing db connections');
				if (dbClient.close) {
					await dbClient.close();
				} else {
					logger.warn(`Can't close db connection, close function is not present`);
				}
				logger.debug('End closing db connections');
			}
			server.getConnections((error3, count2) => {
				if (error3) {
					logger.error('can-not-get-number-of-connections', {
						errString: fastSafeStringify(error3),
						errMessage: error3.message,
					});
					process.exit(1);
				}
				logger.info(`Nb of connections after close : ${count2}`);
			});

			logger.info(`Shutdown SUCCESS`);
			process.exit(0);
		});
	});
}

// istanbul ignore next
export function registerShutdown(
	logger: N9Log,
	shutdownOptions: N9NodeRouting.ShutdownOptions,
	server: Server,
): void {
	process.once('SIGTERM', async () => {
		logger.info('Got SIGTERM. Graceful shutdown start');
		await shutdown(logger, shutdownOptions, server);
	});

	process.once('SIGINT', async () => {
		logger.info('Got SIGINT. Graceful shutdown start');
		await shutdown(logger, shutdownOptions, server);
	});

	process.once('SIGUSR2', async () => {
		logger.info('Got SIGUSR2 (nodemon). Graceful shutdown start');
		await shutdown(logger, shutdownOptions, server);
	});
}
