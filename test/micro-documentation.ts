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

const MICRO_FOO = join(__dirname, 'fixtures/micro-validate/');

test('Read documentation', async (t: Assertions) => {
	stdMock.use({ print: commons.print });
	const { server } = await routingControllerWrapper({
		path: MICRO_FOO
	});
	// Check /documentation
	const res = await rp({ uri: 'http://localhost:5000/documentation.json', resolveWithFullResponse: true, json: true });

	// Check logs
	stdMock.restore();
	stdMock.flush();
	t.is(res.statusCode, 200);
	t.is(res.body.info.title, 'n9-node-routing');
	t.is(Object.keys(res.body.paths).length, 3);

	// Close server
	await closeServer(server);
});
