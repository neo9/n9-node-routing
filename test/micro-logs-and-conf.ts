import ava, { Assertions } from 'ava';
import got from 'got';
import { join } from 'path';
import * as stdMock from 'std-mocks';
// tslint:disable-next-line:import-name
import N9NodeRouting from '../src';
import commons, { closeServer } from './fixtures/commons';

const MICRO_LOGS = join(__dirname, 'fixtures/micro-logs/');
const print = commons.print;

ava('Basic usage, check logs', async (t: Assertions) => {
	stdMock.use({ print });
	global.conf = {
		someConfAttr: 'value',
	};

	const { server } = await N9NodeRouting({
		path: MICRO_LOGS,
		enableLogFormatJSON: false,
	});
	// Check /foo route added on foo/foo.init.ts
	const res = await commons.jsonHttpClient.get('http://localhost:5000/bar');

	// Check logs
	stdMock.restore();
	const output = stdMock.flush().stdout.filter(commons.excludeSomeLogs);
	// Logs on stdout
	t.is(output.length, 5, 'output length');
	t.true(output[0].includes('Init module bar'), 'Init module bar');
	t.true(output[1].includes('Hello bar.init'), 'Hello bar.init');
	t.true(output[2].includes('Listening on port 5000'), 'Listening on port 5000');
	t.true(output[3].includes('message in controller'), 'message in controller');
	t.true(output[3].includes('] ('), 'contains request id');
	t.true(output[3].includes(')'), 'contains request id 2');
	t.true(output[4].includes('] ('));
	const match = output[4].match(/\([a-zA-Z0-9_\-]{7,14}\)/g);
	t.truthy(match, 'should match one');
	const matchLength = match.length;
	t.true(matchLength === 1);
	t.true(output[4].includes('GET /bar'));
	t.deepEqual(res, global.conf, 'body response is conf');
	// Close server
	await closeServer(server);
});

ava('Basic usage, check logs with empty response', async (t: Assertions) => {
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
	const res = await got('http://localhost:5002/empty');
	t.is(res.statusCode, 204, 'resp 204 status');

	// Check logs
	stdMock.restore();
	const output = stdMock.flush().stdout.filter(commons.excludeSomeLogs);

	// Logs on stdout
	t.true(output[0].includes('Init module bar'), 'Init module bar');
	t.true(output[1].includes('Hello bar.init'), 'Hello bar.init');
	t.true(output[2].includes('Listening on port 5002'), 'Listening on port 5002');
	t.true(output[3].includes('] ('));
	t.truthy(output[3].match(/\([a-zA-Z0-9_\-]{7,14}\)/g));
	t.true(output[3].includes('GET /empty'), 'GET /empty');

	// Close server
	await closeServer(server);
});

ava('JSON output', async (t: Assertions) => {
	stdMock.use({ print });
	global.conf = {
		someConfAttr: 'value',
	};

	const { server } = await N9NodeRouting({
		path: MICRO_LOGS,
		enableLogFormatJSON: true,
	});

	// Check /foo route added on foo/foo.init.ts
	const res = await got('http://localhost:5000/bar');
	t.is(res.statusCode, 200);

	// Check logs
	stdMock.restore();
	const output = stdMock.flush().stdout.filter(commons.excludeSomeLogs);
	// Logs on stdout
	t.truthy(output[4].match(/"method":"GET"/g), 'GET /bar 1');
	t.truthy(output[4].match(/"path":"\/bar"/g), 'GET /bar 2');
	t.truthy(
		output[4].match(/"durationMs":[0-9]{1,5}\.[0-9]{1,5}/g),
		`Has response time ms : ${output[4]}`,
	);
	t.truthy(
		output[4].match(/"totalDurationMs":[0-9]{1,5}\.[0-9]{1,5}/g),
		'Has total response time ms',
	);

	// Close server
	await closeServer(server);
});
