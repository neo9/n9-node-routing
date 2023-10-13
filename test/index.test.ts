import n9NodeLog from '@neo9/n9-node-log';
import { N9Error } from '@neo9/n9-node-utils';
import test, { ExecutionContext } from 'ava';
import * as stdMock from 'std-mocks';

import N9NodeRouting from '../src';
import {
	defaultNodeRoutingConfOptions,
	end,
	init,
	mockAndCatchStd,
	TestContext,
	urlPrefix,
} from './fixtures';

const { runBeforeTest } = init('', {
	avoidBeforeEachHook: true,
	n9NodeRoutingOptions: {
		prometheus: {
			isEnabled: false,
		},
	},
});

test('Works with custom port', async (t: ExecutionContext<TestContext>) => {
	await runBeforeTest(t, {
		n9NodeRoutingOptions: {
			http: { port: 4002 },
			prometheus: {
				isEnabled: false,
			},
		},
	});
	t.true(t.context.stdout[4].includes('Listening on port 4002'), 'print launch port');
});

test('Works with preventListen = true', async (t: ExecutionContext<TestContext>) => {
	await runBeforeTest(t, {
		n9NodeRoutingOptions: {
			http: { port: 4002, preventListen: true },
		},
	});
	const output = stdMock.flush();

	t.is(output.stderr.length, 0);
	const err: N9Error = await t.throwsAsync(async () =>
		t.context.httpClient.get('http://localhost:4200'),
	);
	t.is(err.context.srcError.name, 'RequestError');
	t.is(err.status, 500);
});

test('Should keep the custom logger and listening on port 5000', async (t: ExecutionContext<TestContext>) => {
	const log = n9NodeLog('custom');
	await runBeforeTest(t, {
		nodeEnvValue: 'development',
		n9NodeRoutingOptions: {
			log,
		},
	});

	t.true(t.context.stdout[4].includes('Listening on port 5000'));
	t.true(t.context.stdout[4].includes('"label":"custom"'));
});

test('Works without options (except conf for tests)', async (t: ExecutionContext<TestContext>) => {
	await runBeforeTest(t, {
		nodeEnvValue: 'development',
	});

	t.true(
		t.context.stdout[4].includes('[n9-node-routing] Listening on port 5000'),
		`[n9-node-routing] Listening on port 5000 output : ${JSON.stringify(t.context.stdout)}`,
	);
});
test('Works without options in production (except conf for test purpose)', async (t: ExecutionContext<TestContext>) => {
	await runBeforeTest(t, {
		nodeEnvValue: 'production',
	});

	const line2 = JSON.parse(t.context.stdout[4]);
	delete line2.timestamp;

	t.deepEqual(line2, {
		label: 'n9-node-routing',
		level: 'info',
		message: 'Listening on port 5000',
	});
});

test('Get app name on /', async (t: ExecutionContext<TestContext>) => {
	await runBeforeTest(t);
	// OK if no error thrown
	await t.notThrowsAsync(async () => await t.context.httpClient.get(urlPrefix));
});

test('Should not log the requests http.logLevel=false', async (t: ExecutionContext<TestContext>) => {
	await runBeforeTest(t, {
		n9NodeRoutingOptions: {
			http: { logLevel: false },
		},
	});
	const { stdLength } = await mockAndCatchStd(async () => {
		await t.context.httpClient.get(urlPrefix);
		await t.context.httpClient.get([urlPrefix, 'ping']);
		await t.context.httpClient.get([urlPrefix, 'routes']);
	});
	t.is(stdLength, 0);
});

test('Should log the requests with custom level', async (t: ExecutionContext<TestContext>) => {
	await runBeforeTest(t, {
		n9NodeRoutingOptions: {
			http: { logLevel: ':status :url' },
		},
	});

	const { stdLength, stdout } = await mockAndCatchStd(async () => {
		await t.context.httpClient.get(urlPrefix);
		await t.context.httpClient.get([urlPrefix, 'ping']);
		await t.context.httpClient.get([urlPrefix, 'routes']);
	});
	t.is(stdLength, 3, 'length');
	t.true(stdout[0].includes('200 /'), '200 /');
	t.true(stdout[1].includes('200 /ping'), 'ping');
	t.true(stdout[2].includes('200 /routes'), 'routes');
});

test('Fails with PORT without access', async (t: ExecutionContext<TestContext>) => {
	await runBeforeTest(t, {
		n9NodeRoutingOptions: {
			http: {
				port: 80,
			},
		},
		mockAndCatchStdOptions: {
			throwError: false,
		},
	});

	t.true(t.context.runBeforeTestError.message.includes('Port 80 requires elevated privileges'));
});

test('Fails with PORT already used', async (t: ExecutionContext<TestContext>) => {
	let server;
	const { stdout } = await mockAndCatchStd(async () => {
		const startUpResult = await N9NodeRouting({
			http: { port: 6000 },
			conf: defaultNodeRoutingConfOptions,
		});
		server = startUpResult.server;
	});

	await runBeforeTest(t, {
		n9NodeRoutingOptions: {
			http: {
				port: 6000,
			},
		},
		mockAndCatchStdOptions: {
			throwError: false,
		},
	});

	t.true(stdout[4].includes('Listening on port 6000'));
	t.true(t.context.runBeforeTestError.message.includes('Port 6000 is already in use'));

	await end(server);
});

test('Fails with PORT not in common range', async (t: ExecutionContext<TestContext>) => {
	await runBeforeTest(t, {
		n9NodeRoutingOptions: {
			http: {
				port: 10000000,
			},
		},
		mockAndCatchStdOptions: {
			throwError: false,
		},
	});
	t.true(t.context.runBeforeTestError.message.includes('ort should be'));
});

test('Should work without options using default loading conf options', async (t: ExecutionContext<TestContext>) => {
	// throw an error because there is no conf in n9NodeRouting
	const error = await t.throwsAsync(N9NodeRouting());

	t.true(!!error);
	t.true(error.message.includes('Could not load config file'));
	t.true(error.message.includes('conf/application'));
});
