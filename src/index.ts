import n9Log from '@neo9/n9-node-log';
import * as appRootDir from 'app-root-dir';
import { createNamespace } from 'continuation-local-storage';
import { join } from 'path';
// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';
import { Container } from 'typedi';
import initModules from './initialise-modules';
import { N9NodeRouting } from './models/routing.models';
import { requestIdFilter } from './requestid';
import bindSpecificRoutes from './routes';
import expressAppStarter from './start-express-app';
import { waitFor } from '@neo9/n9-node-utils';

/* istanbul ignore next */
function handleThrow(err: Error): void {
	throw err;
}

export * from 'class-validator';
export { getMetadataArgsStorage } from 'routing-controllers';
export * from 'routing-controllers-openapi';

export * from './decorators/acl.decorator';
export * from './validators/date-parser.validator';
export * from './models/routing.models';
export * from './models/routes.models';

export default async function(options?: N9NodeRouting.Options): Promise<N9NodeRouting.ReturnObject> {
	// Provides a stack trace for unhandled rejections instead of the default message string.
	process.on('unhandledRejection', handleThrow);

	// Options default
	options = options || {};
	options.path = options.path || join(appRootDir.get(), 'src', 'modules');
	options.log = options.log || global.log;
	options.hasProxy = (typeof options.hasProxy === 'boolean' ? options.hasProxy : true);
	options.enableRequestId = (typeof options.enableRequestId === 'boolean' ? options.enableRequestId : true);
	options.enableLogFormatJSON = (typeof options.enableLogFormatJSON === 'boolean' ? options.enableLogFormatJSON : true);

	const formatLogInJSON = options.enableLogFormatJSON && process.env.NODE_ENV && process.env.NODE_ENV !== 'development';
	global.n9NodeRoutingData = {
		formatLogInJSON,
		options
	};

	// If log if given, add a namespace
	if (options.log) {
		options.log = options.log.module('n9-node-routing');
	} else {
		options.log = n9Log('n9-node-routing', {
			formatJSON: formatLogInJSON,
		});
	}
	if (options.enableRequestId) {
		options.log.addFilter(requestIdFilter);
	}

	Container.set('logger', options.log);
	if (global.conf) {
		Container.set('conf', global.conf);
	}

	// Init every modules
	await initModules(options.path, options.log);
	const returnObject = await expressAppStarter(options);
	await bindSpecificRoutes(returnObject.app, options);

	return returnObject;
}
