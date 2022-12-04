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

export const fixturesDirname: string = __dirname;

export const defaultConfOptions: N9NodeRouting.ConfOptions = {
	n9NodeConf: {
		path: join(__dirname, 'micro-conf-validation/configuration-valid/conf'),
	},
};

export const minimalOptions: N9NodeRouting.Options = {
	path: fixturesDirname,
	conf: defaultConfOptions,
};
