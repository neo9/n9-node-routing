import n9Log from '@neo9/n9-node-log';
import { N9Error } from '@neo9/n9-node-utils';
import * as appRootDir from 'app-root-dir';
import { join } from 'path';
// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';
import initModules from './initialise-modules';
import { N9NodeRouting } from './models/routing.models';
import { registerShutdown } from './register-system-signals';
import { requestIdFilter } from './requestid';
import startExpressApp from './start-express-app';
// tslint:disable-next-line:no-import-side-effect
import './utils/error-to-json';

/* istanbul ignore next */
function handleThrow(err: Error): void {
	(global.log || console).log(`Global error n ot handled`, { err });
	throw err;
}

export * from 'class-validator';

export * from './decorators/acl.decorator';
export * from './validators/date-parser.validator';
export * from './middleware/session-auth.guard';
export * from './models/routing.models';
export * from './models/routes.models';
export * from './utils/http-client-base';

export default async function (options: N9NodeRouting.Options = {}): Promise<N9NodeRouting.ReturnObject> {
	// Provides a stack trace for unhandled rejections instead of the default message string.
	process.on('unhandledRejection', handleThrow);

	// Options default
	options.path = options.path || join(appRootDir.get(), 'src', 'modules');
	options.log = options.log || global.log;
	options.hasProxy = typeof options.hasProxy === 'boolean' ? options.hasProxy : true;
	options.enableRequestId = typeof options.enableRequestId === 'boolean' ? options.enableRequestId : true;
	options.enableLogFormatJSON = typeof options.enableLogFormatJSON === 'boolean' ? options.enableLogFormatJSON : true;
	options.shutdown = options.shutdown || {};
	options.shutdown.enableGracefulShutdown = typeof options.shutdown.enableGracefulShutdown === 'boolean' ? options.shutdown.enableGracefulShutdown : true;
	options.shutdown.timeout = typeof options.shutdown.timeout === 'number' ? options.shutdown.timeout : 10 * 1000;
	options.shutdown.waitDurationBeforeStop = typeof options.shutdown.waitDurationBeforeStop === 'number' ? options.shutdown.waitDurationBeforeStop : 1000;
	if (!options.openapi) {
		options.openapi = {
			isEnable: true,
		};
	}
	options.openapi.swaggerui = options.openapi.swaggerui || Object.assign({}, options.openapi.swaggerui, { swaggerUrl: '../documentation.json' });

	const formatLogInJSON = options.enableLogFormatJSON && process.env.NODE_ENV && process.env.NODE_ENV !== 'development';
	global.n9NodeRoutingData = {
		formatLogInJSON,
		options,
	};

	if (global.log) {
		global.log = n9Log(global.log.name, {
			...global.log.options,
			formatJSON: formatLogInJSON,
		});
	}

	// If log if given, add a namespace
	if (options.log) {
		options.log = options.log.module('n9-node-routing', {
			formatJSON: formatLogInJSON,
		});
	} else {
		options.log = n9Log('n9-node-routing', {
			formatJSON: formatLogInJSON,
		});
	}

	if(!global.log) {
		global.log = options.log;
	}

	if (options.enableRequestId) {
		options.log.addFilter(requestIdFilter);
	}

	// Init every modules
	await initModules(options.path, options.log);
	const returnObject = await startExpressApp(options);
	// console.log(`-- index.ts app._router.stack --`, returnObject.app._router.stack);

	// Manage SIGTERM & SIGINT
	if (options.shutdown.enableGracefulShutdown) {
		registerShutdown(options.log, options.shutdown, returnObject.server);
	}

	return returnObject;
}
