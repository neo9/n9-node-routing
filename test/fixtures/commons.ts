import { N9Log } from '@neo9/n9-node-log';
import { Server } from 'http';

import { N9HttpClient } from '../../src';

export default {
	print: true,
	excludeSomeLogs: (): boolean => true,
	jsonHttpClient: new N9HttpClient(new N9Log('tests')),
};

export const closeServer = async (server: Server): Promise<Error> => {
	return await new Promise((resolve) => {
		server.close(resolve);
	});
};
