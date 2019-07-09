import test, { Assertions } from 'ava';
import { Server } from 'http';
import { join } from 'path';
import * as rp from 'request-promise-native';
import * as stdMock from 'std-mocks';

import N9NodeRouting from '../src';
import commons from './fixtures/commons';

const closeServer = async (server: Server) => {
	return new Promise((resolve) => {
		server.close(resolve);
	});
};

const MICRO_LOGS = join(__dirname, 'fixtures/micro-logs/');
const print = commons.print;

test('Basic usage, check logs', async (t: Assertions) => {
	stdMock.use({ print });
	global.conf = {
		someConfAttr: 'value',
	};

	const { server } = await N9NodeRouting({
		path: MICRO_LOGS,
	});
	// Check /foo route added on foo/foo.init.ts
	const res = await rp({ uri: 'http://localhost:5000/bar', resolveWithFullResponse: true, json: true });
	t.is(res.statusCode, 200);

	// Check logs
	stdMock.restore();
	const output = stdMock.flush().stdout.filter(commons.excludeSomeLogs);
	// Logs on stdout
	t.true(output[0].includes('Init module bar'), 'Init module bar');
	t.true(output[1].includes('Hello bar.init'), 'Hello bar.init');
	t.true(output[2].includes('Listening on port 5000'), 'Listening on port 5000');
	t.true(output[3].includes('message in controller'), 'message in controller');
	t.true(output[3].includes('] ('), 'contains request id');
	t.true(output[3].includes(')'), 'contains request id 2');
	t.true(output[4].includes('GET /bar'), 'GET /bar');
	t.deepEqual(res.body, global.conf, 'body response is conf');
	// Close server
	await closeServer(server);
});

test('Basic usage, check logs with empty response', async (t: Assertions) => {
	stdMock.use({ print });
	global.conf = {
		someConfAttr: 'value',
	};

	const { server } = await N9NodeRouting({
		http: {
			port: 5002,
		},
		path: MICRO_LOGS,
	});
	// Check /foo route added on foo/foo.init.ts
	const res = await rp({ uri: 'http://localhost:5002/empty', resolveWithFullResponse: true, json: true });
	t.is(res.statusCode, 204, 'resp 204 status');

	// Check logs
	stdMock.restore();
	const output = stdMock.flush().stdout.filter(commons.excludeSomeLogs);

	// Logs on stdout
	t.true(output[0].includes('Init module bar'), 'Init module bar');
	t.true(output[1].includes('Hello bar.init'), 'Hello bar.init');
	t.true(output[2].includes('Listening on port 5002'), 'Listening on port 5002');
	t.true(output[3].includes('GET /empty'), 'GET /empty');

	// Close server
	await closeServer(server);
});
