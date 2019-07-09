import test, { Assertions } from 'ava';
import { Server } from 'http';
import { join } from 'path';
import * as rp from 'request-promise-native';
import * as stdMock from 'std-mocks';

import routingControllerWrapper from '../src';
import commons from './fixtures/commons';

const closeServer = async (server: Server) => {
	return new Promise((resolve) => {
		server.close(resolve);
	});
};

const MICRO_FOO = join(__dirname, 'fixtures/micro-stream/');

test('Basic stream', async (t: Assertions) => {
	stdMock.use({ print: commons.print });
	const { server } = await routingControllerWrapper({
		path: MICRO_FOO,
		http: { port: 6001 }
	});

	const res = await rp({ uri: 'http://localhost:6001/users', resolveWithFullResponse: true, json: true });
	t.is(res.statusCode, 200);
	t.is(res.body.items.length, 4, 'check length');
	t.is(typeof res.body.metaData, 'object', 'metadata is object');

	// Close server
	await closeServer(server);
});
