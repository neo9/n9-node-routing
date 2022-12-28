import ava, { Assertions } from 'ava';
import got from 'got';
import { join } from 'path';
import * as stdMock from 'std-mocks';
import * as tmp from 'tmp-promise';

// tslint:disable-next-line:import-name
import N9NodeRouting from '../src';
import commons, { defaultNodeRoutingConfOptions } from './fixtures/commons';
import { end, getLogsFromFile } from './fixtures/helper';

const microLogs = join(__dirname, 'fixtures/micro-logs/');
const print = commons.print;

ava('Basic usage, check logs', async (t: Assertions) => {
	const file = await tmp.file();
	(global as any).conf = {
		someConfAttr: 'value',
	};

	const { server, prometheusServer } = await N9NodeRouting({
		path: microLogs,
		enableLogFormatJSON: false,
		logOptions: { developmentOutputFilePath: file.path },
		conf: defaultNodeRoutingConfOptions,
	});
	// Check /foo route added on foo/foo.init.ts
	const res = await commons.jsonHttpClient.get('http://localhost:5000/bar');

	// Check logs
	const output = await getLogsFromFile(file.path);

	t.is(output.length, 11, 'output length');
	t.true(
		output[0].includes('It is recommended to use JSON format outside development environment'),
		'Warn n9--node-log',
	);
	t.true(output[5].includes('Init module bar'), 'Init module bar');
	t.true(output[6].includes('Hello bar.init'), 'Hello bar.init');
	t.true(output[7].includes('Listening on port 5000'), 'Listening on port 5000');
	t.true(output[8].includes('startup'), 'Startup');
	t.true(output[8].includes('durationMs'), 'Duration Ms of statup');
	t.true(output[9].includes('message in controller'), 'message in controller');
	t.true(output[9].includes('] ('), 'contains request id');
	t.true(output[9].includes(')'), 'contains request id 2');
	t.true(output[10].includes('] ('));
	const match = output[10].match(/\([a-zA-Z0-9_-]{7,14}\)/g);
	t.truthy(match, 'should match one');
	const matchLength = match.length;
	t.true(matchLength === 1);
	t.true(output[10].includes('GET /bar'));
	t.deepEqual(res, (global as any).conf, 'body response is conf');
	// Close server
	await end(server, prometheusServer);
});

ava('Basic usage, check logs with empty response', async (t: Assertions) => {
	const oldNodeEnv = process.env.NODE_ENV;
	process.env.NODE_ENV = 'development';
	delete (global as any).log;
	const file = await tmp.file();
	(global as any).conf = {
		someConfAttr: 'value',
	};

	const { server, prometheusServer } = await N9NodeRouting({
		http: {
			port: 5002,
		},
		path: microLogs,
		logOptions: { developmentOutputFilePath: file.path },
		conf: defaultNodeRoutingConfOptions,
	});
	// Check /foo route added on foo/foo.init.ts
	const res = await got('http://localhost:5002/empty');
	t.is(res.statusCode, 204, 'resp 204 status');

	// Check logs
	const output = await getLogsFromFile(file.path);

	t.is(output.length, 9, 'check nb logs');
	t.true(output[4].includes('Init module bar'), 'Init module bar');
	t.true(output[5].includes('Hello bar.init'), 'Hello bar.init');
	t.true(output[6].includes('Listening on port 5002'), 'Listening on port 5002');
	t.true(output[8].includes('] ('));
	t.truthy(output[8].match(/\([a-zA-Z0-9_-]{7,14}\)/g));
	t.true(output[8].includes('GET /empty'), 'GET /empty');

	// Close server
	await end(server, prometheusServer);
	process.env.NODE_ENV = oldNodeEnv;
});

ava('JSON output', async (t: Assertions) => {
	stdMock.use({ print });
	(global as any).conf = {
		someConfAttr: 'value',
	};

	const { server, prometheusServer } = await N9NodeRouting({
		path: microLogs,
		enableLogFormatJSON: true,
		conf: defaultNodeRoutingConfOptions,
	});

	// Check /foo route added on foo/foo.init.ts
	const res = await got('http://localhost:5000/bar');
	t.is(res.statusCode, 200);

	// Check logs
	stdMock.restore();
	const output = stdMock.flush().stdout.filter(commons.excludeSomeLogs);

	const lineChecked = output[8];
	t.truthy(lineChecked);
	t.truthy(lineChecked.match(/"method":"GET"/g), 'GET /bar 1');
	t.truthy(lineChecked.match(/"path":"\/bar"/g), 'GET /bar 2');
	t.truthy(
		lineChecked.match(/"durationMs":[0-9]{1,5}\.[0-9]{1,5}/g),
		`Has response time ms : ${lineChecked}`,
	);
	t.truthy(
		lineChecked.match(/"totalDurationMs":[0-9]{1,5}\.[0-9]{1,5}/g),
		'Has total response time ms',
	);

	// Close server
	await end(server, prometheusServer);
});
