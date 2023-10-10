import { Server } from 'http';
import { join } from 'path';

import { N9NodeRouting } from '../../src';
import { N9NodeRoutingBaseConf } from '../../src/models/routing';

export default {
	print: true,
	// Allow developers to add console log in N9NodeRouting then exclude them for tests
	excludeSomeLogs: (log: string): boolean => {
		return !log.includes(' -- ');
	},
};

export const closeServer = async (server: Server): Promise<Error> => {
	return await new Promise((resolve) => {
		server.close(resolve);
	});
};

export const defaultNodeRoutingConfOptions: N9NodeRouting.ConfOptions<N9NodeRoutingBaseConf> = {
	n9NodeConf: {
		path: join(__dirname, 'common-conf-validation/configuration-valid/conf'),
	},
};

export const nodeRoutingMinimalOptions: N9NodeRouting.Options = {
	conf: defaultNodeRoutingConfOptions,
};
