import n9Log from '@neo9/n9-node-log';
import * as appRootDir from 'app-root-dir';
import { join } from 'path';
// tslint:disable-next-line:no-import-side-effect
import "reflect-metadata";
import { Container } from 'typedi';
import initModules from './initialise-modules';
import { RoutingControllerWrapper } from './models/wrapper.models';
import { requestIdFilter } from './requestid';
import bindSpecificRoutes from './routes';
import expressAppStarter from './start-express-app';

/* istanbul ignore next */
function handleThrow(err: Error): void {
	throw err;
}

export * from './decorators/acl.decorator';
export * from './validators/date-parser.validator';

export default async function(options?: RoutingControllerWrapper.Options): Promise<RoutingControllerWrapper.ReturnObject> {
	// Provides a stack trace for unhandled rejections instead of the default message string.
	process.on('unhandledRejection', handleThrow);

	// Options default
	options = options || {};
	options.path = options.path || join(appRootDir.get(), 'src', 'modules');
	options.log = options.log || global.log;
	options.hasProxy = (typeof options.hasProxy === 'boolean' ? options.hasProxy : true);
	options.enableRequestId = (typeof options.enableRequestId === 'boolean' ? options.enableRequestId : true);

	// If log if given, add a namespace
	if (options.log) {
		options.log = options.log.module('routing-controller-wrapper');
	} else {
		options.log = n9Log('routing-controller-wrapper');
	}
	if (options.enableRequestId) {
		options.log.addFilter(requestIdFilter);
	}

	Container.set("logger", options.log);
	if (global.conf) {
		Container.set("conf", global.conf);
	}

	// Init every modules
	await initModules(options.path, options.log);
	const returnObject = await expressAppStarter(options);
	await bindSpecificRoutes(returnObject.app, options);

	return returnObject;
}
