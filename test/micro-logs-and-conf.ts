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

const MICRO_LOGS = join(__dirname, 'fixtures/micro-logs/');

test('Basic usage, check logs', async (t: Assertions) => {
	stdMock.use({ print: commons.print });
	global.conf = {
		someConfAttr: 'value',
	};

	const { server } = await routingControllerWrapper({
		path: MICRO_LOGS,
	});
	// Check /foo route added on foo/foo.init.ts
	const res = await rp({ uri: 'http://localhost:5000/bar', resolveWithFullResponse: true, json: true });
	t.is(res.statusCode, 200);

	// Check logs
	stdMock.restore();
	const output = stdMock.flush();

	// Logs on stdout
	t.true(output.stdout[0].includes('Init module bar'));
	t.true(output.stdout[1].includes('Hello bar.init'));
	t.true(output.stdout[2].includes('Listening on port 5000'));
	t.true(output.stdout[3].includes('message in controller'));
	t.true(output.stdout[3].includes('] ('));
	t.true(output.stdout[3].includes(')'));
	t.true(output.stdout[4].includes('] ('));
	const matchLength = output.stdout[4].match(/\([a-zA-Z0-9_\-]{7,14}\)/g).length;
	t.true(matchLength === 1);
	t.true(output.stdout[4].includes('GET /bar'));
	t.deepEqual(res.body, global.conf);
	// Close server
	await closeServer(server);
});

test('Basic usage, check logs with empty response', async (t: Assertions) => {
	stdMock.use({ print: commons.print });
	global.conf = {
		someConfAttr: 'value'
	};

	const { server } = await routingControllerWrapper({
		http: {
			port: 5002
		},
		path: MICRO_LOGS
	});
	// Check /foo route added on foo/foo.init.ts
	const res = await rp({ uri: 'http://localhost:5002/empty', resolveWithFullResponse: true, json: true });
	t.is(res.statusCode, 204);

	// Check logs
	stdMock.restore();
	const output = stdMock.flush();

	// Logs on stdout
	t.true(output.stdout[0].includes('Init module bar'));
	t.true(output.stdout[1].includes('Hello bar.init'));
	t.true(output.stdout[2].includes('Listening on port 5002'));
	t.true(output.stdout[3].includes('] ('));
	t.true(output.stdout[3].match(/\([a-zA-Z0-9_\-]{7,14}\)/g).length > 0);
	t.true(output.stdout[3].includes('GET /empty'));

	// Close server
	await closeServer(server);
});
