import { N9Log, safeStringify } from '@neo9/n9-node-log';
import { waitFor } from '@neo9/n9-node-utils';
import { signalIsNotUp } from '@promster/express';
import { Server } from 'http';

import * as N9NodeRouting from './models/routing';
import * as Routes from './routes';

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

	// Tell users to stop using the app
	signalIsNotUp();
	Routes.onShutdownAsked();

	if (shutdownOptions.callbacksOnShutdownSignalReceived?.length) {
		logger.info(
			`Calling ${shutdownOptions.callbacksOnShutdownSignalReceived.length} on shutdown signal received callbacks`,
		);
		for (const callbackSpec of shutdownOptions.callbacksOnShutdownSignalReceived) {
			if (callbackSpec.name) logger.info(`Calling ${callbackSpec.name}`);
			await callbackSpec.function.bind(callbackSpec.thisArg)(logger);
		}
	}

	const waitDuration = shutdownOptions.waitDurationBeforeStop;
	// For Kubernetes downscale, let the DNS some time to dereference the pod IP
	logger.info(`Wait ${waitDuration} ms before exit`);
	await waitFor(waitDuration);

	if (shutdownOptions.callbacksBeforeShutdown?.length) {
		logger.info(`Calling ${shutdownOptions.callbacksBeforeShutdown.length} callbacks`);
		for (const callbackSpec of shutdownOptions.callbacksBeforeShutdown) {
			if (callbackSpec.name) logger.info(`Calling ${callbackSpec.name}`);
			await callbackSpec.function.bind(callbackSpec.thisArg)(logger);
		}
	}
	server.getConnections((error1, count) => {
		if (error1) {
			logger.error('can-not-get-number-of-connections', {
				errString: safeStringify(error1),
				errMessage: error1.message,
			});
			process.exit(1);
		}
		logger.info(`Nb of connections before close : ${count}`);

		server.close(async (error2) => {
			if (error2) {
				logger.error('can-not-shutdown-gracefully', {
					errString: safeStringify(error2),
					errMessage: error2.message,
				});
				process.exit(1);
			}

			if (shutdownOptions.callbacksBeforeShutdownAfterExpressEnded?.length) {
				logger.info(
					`Calling ${shutdownOptions.callbacksBeforeShutdownAfterExpressEnded.length} callbacks`,
				);
				for (const callbackSpec of shutdownOptions.callbacksBeforeShutdownAfterExpressEnded) {
					if (callbackSpec.name) logger.info(`Calling ${callbackSpec.name}`);
					await callbackSpec.function.bind(callbackSpec.thisArg)(logger);
				}
			}

			server.getConnections((error3, count2) => {
				if (error3) {
					logger.error('can-not-get-number-of-connections', {
						errString: safeStringify(error3),
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
