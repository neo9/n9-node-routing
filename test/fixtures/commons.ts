import { N9Log } from '@neo9/n9-node-log';
import { Server } from 'http';
import { join } from 'path';

import { N9HttpClient, N9NodeRouting } from '../../src';

export default {
	print: true,
	// Allow developers to add console log in N9NodeRouting then exclude them for tests
	excludeSomeLogs: (): boolean => true,
	jsonHttpClient: new N9HttpClient(new N9Log('tests')),
};

export const closeServer = async (server: Server): Promise<Error> => {
	return await new Promise((resolve) => {
		server.close(resolve);
	});
};

export const defaultNodeRoutingConfOptions: N9NodeRouting.ConfOptions = {
	n9NodeConf: {
		path: join(__dirname, 'common-conf-validation/configuration-valid/conf'),
	},
};

export const nodeRoutingMinimalOptions: N9NodeRouting.Options = {
	conf: defaultNodeRoutingConfOptions,
};
