import { N9HttpClient } from '../../src';
import { N9Log } from '@neo9/n9-node-log';
import { Server } from 'http';

export default {
	print: false,
	excludeSomeLogs: () => true,
	jsonHttpClient: new N9HttpClient(new N9Log('tests')),
};

export const closeServer = async (server: Server) => {
	return new Promise((resolve) => {
		server.close(resolve);
	});
};
