import { N9Error } from '@neo9/n9-node-utils';
import test, { ExecutionContext } from 'ava';

import {
	init,
	mockAndCatchStd,
	parseJSONLogAndRemoveTime,
	TestContext,
	urlPrefix,
} from './fixtures';

const { runBeforeTest } = init('micro-foo', {
	nodeEnvValue: 'production',
	avoidBeforeEachHook: true,
});

test.serial('Basic usage, create http server', async (t: ExecutionContext<TestContext>) => {
	await runBeforeTest(t, {
		nodeEnvValue: 'development',
	});

	let logIndex = 1;
	t.true(t.context.stdout[1].includes('env: development'), 'env: development');
	logIndex += 2;
	t.true(
		t.context.stdout[3].includes('Configuration validation is disabled'),
		'Configuration validation is disabled',
	);
	logIndex += 1;
	t.regex(t.context.stdout[logIndex], /Run init module bar/, 'Run init module bar');
	logIndex += 1;
	t.regex(t.context.stdout[logIndex], /Run init module foo/, 'Run init module foo');
	logIndex += 1;
	t.regex(t.context.stdout[logIndex], /Hello foo.init/, 'Hello foo.init');
	logIndex += 1;
	t.regex(t.context.stdout[logIndex], /End running init module bar/, 'End running init module bar');
	logIndex += 1;
	t.regex(t.context.stdout[logIndex], /End running init module foo/, 'End running init module foo');
	logIndex += 1;
	t.regex(t.context.stdout[logIndex], /Listening on port 5000/, 'Listening on port 5000');
	logIndex += 1;
	t.regex(t.context.stdout[logIndex], /startup/, 'startup');

	const { stdout } = await mockAndCatchStd(async () => {
		// Check /foo route added on foo/foo.init.ts
		let res: any = await t.context.httpClient.get<{ foo: string }>([urlPrefix, 'foo']);
		t.is(res.foo, 'bar');

		// Check / route
		res = await t.context.httpClient.get<{ name: string }>(urlPrefix);
		t.deepEqual(res, { name: '@neo9/n9-node-routing' });

		// Check /ping route
		res = await t.context.httpClient.get<{ response: string }>([urlPrefix, 'ping']);
		t.deepEqual(res, { response: 'pong' });

		// Check /version route
		res = await t.context.httpClient.get<{ version: string }>([urlPrefix, 'version']);
		const matchVersion = res.version.match(/^[0-9]+\.[0-9]+\.[0-9]+.*$/);
		t.is(matchVersion.length, 1);

		// Check /404 route
		res = await t.throwsAsync<N9Error>(
			async () => await t.context.httpClient.get([urlPrefix, '404']),
		);
		t.is(res.status, 404, '404');
		t.is(res.message, 'not-found', 'not-found');
		t.is(res.context?.srcError?.context?.url, '/404', '/404');
	});

	logIndex = 0;
	t.true(stdout[logIndex].includes('GET /foo'), 'GET /foo');
	logIndex += 1;
	t.true(stdout[logIndex].includes('GET /'), 'GET /');
	logIndex += 1;
	t.true(stdout[logIndex].includes('GET /ping'), 'GET /ping');
	logIndex += 1;
	t.true(stdout[logIndex].includes('GET /version'), 'GET /version');
	logIndex += 1;
	t.true(stdout[logIndex].includes('not-found'), `not-found | ${stdout[logIndex]}`);
	logIndex += 2;
	t.true(
		stdout[logIndex].includes('  "err": {'),
		`Error details on multi-lines | ${stdout[logIndex]}`,
	);
	logIndex += 7;
	t.true(
		stdout[logIndex].includes('"type": "N9Error",'),
		`Error details on multi-lines | ${stdout[logIndex]}`,
	);
	logIndex += 1;
	t.true(
		stdout[logIndex].includes('"message": "not-found",'),
		`Error details on multi-lines | ${stdout[logIndex]}`,
	);
	logIndex += 1;
	t.true(
		stdout[logIndex].includes('"stack":'),
		`Error details on multi-lines | ${stdout[logIndex]}`,
	);
	t.true(
		stdout[logIndex].includes('Error: not-found'),
		`Error details on multi-lines | ${stdout[logIndex]}`,
	);

	t.true(stdout[stdout.length - 1].includes('GET /404'), `GET /404 ${stdout[stdout.length - 1]}`);
});

test.serial(
	'Basic usage, create http server on production',
	async (t: ExecutionContext<TestContext>) => {
		await runBeforeTest(t, {
			nodeEnvValue: 'production',
		});
		const stdout = t.context.stdout;

		const mockAndCatchStdResult = await mockAndCatchStd(async () => {
			// Check /foo route added on foo/foo.init.ts
			let res: any = await t.context.httpClient.get([urlPrefix, 'foo']);
			t.is(res.foo, 'bar');

			// Check / route
			res = await t.context.httpClient.get<{ name: string }>(urlPrefix);
			t.deepEqual(res, { name: '@neo9/n9-node-routing' });

			// Check /ping route
			res = await t.context.httpClient.get<{ response: string }>([urlPrefix, 'ping']);
			t.deepEqual(res, { response: 'pong' });

			// Check /404 route
			res = await t.throwsAsync<N9Error>(
				async () => await t.context.httpClient.get([urlPrefix, '404']),
			);
			t.is(res.status, 404);
			t.is(res.message, 'not-found');
			t.is(res.context?.srcError?.context?.url, '/404');
		});
		stdout.push(...mockAndCatchStdResult.stdout);

		// Logs on stdout
		let index = 4;
		// order of first line is no guaranteed
		const line1 = parseJSONLogAndRemoveTime(stdout[index]);
		index += 1;
		const line2 = parseJSONLogAndRemoveTime(stdout[index]);
		const lineFooIsFirst = JSON.stringify(line1).includes('foo');
		t.deepEqual(
			lineFooIsFirst ? line1 : line2,
			{ level: 'info', message: 'Run init module foo', label: '@neo9/n9-node-routing' },
			`Init module foo`,
		);
		t.deepEqual(
			lineFooIsFirst ? line2 : line1,
			{ level: 'info', message: 'Run init module bar', label: '@neo9/n9-node-routing' },
			`Init module bar`,
		);
		index += 1;
		t.deepEqual(
			parseJSONLogAndRemoveTime(stdout[index]),
			{ level: 'info', message: 'Hello foo.init', label: '@neo9/n9-node-routing:foo' },
			`Hello foo.init`,
		);
		index += 1;
		t.deepEqual(
			parseJSONLogAndRemoveTime(stdout[index]),
			{ level: 'info', message: 'Listening on port 5000', label: '@neo9/n9-node-routing' },
			'Listening on port 5000',
		);
		index += 2;
		t.true(
			stdout[index].includes(',"path":"/foo","status":"200","durationMs":'),
			`path" /foo ${stdout[index]}`,
		);
		index += 1;
		t.true(
			stdout[index].includes(',"path":"/","status":"200","durationMs":'),
			`path / | ${stdout[index]}`,
		);
		index += 1;
		t.true(
			stdout[index].includes(',"path":"/ping","status":"200","durationMs":'),
			`path /ping | ${stdout[index]}`,
		);
		index += 1;

		t.true(
			stdout[index].includes('"status":404,"context":{"url":"/404"},"hostname":'),
			`status 404 | ${stdout[index]}`,
		);
		t.true(
			stdout[index].includes('"stack":"Error: not-found'),
			`Error: not-found | ${stdout[index]}`,
		);
		index += 1;
		t.true(
			stdout[index].includes(',"path":"/404","status":"404","durationMs":'),
			`path /404 | ${stdout[index]}`,
		);
	},
);

test.serial('Check /routes', async (t: ExecutionContext<TestContext>) => {
	await runBeforeTest(t);

	// Check acl on routes
	const res = await t.context.httpClient.get<any[]>([urlPrefix, 'routes']);
	t.is(res.length, 1);

	const route1 = res[0];
	t.is(route1.description, undefined);
	t.is(route1.method, 'get');
	t.is(route1.path, '/foo');
	t.is(route1.acl.perms[0].action, 'readFoo');
});

test.serial('Call routes (versioning)', async (t: ExecutionContext<TestContext>) => {
	await runBeforeTest(t);

	const { stderr } = await mockAndCatchStd(async () => {
		let res = await t.context.httpClient.post<any>([urlPrefix, 'v1', 'bar']);
		t.is(res.bar, 'foo');

		// Call /v1/fou
		res = await t.context.httpClient.post([urlPrefix, 'v1', 'fou'], { hi: 'hello' });
		t.deepEqual(res, { hi: 'hello' });

		// Call special route which fails
		let err = await t.throwsAsync<N9Error>(async () =>
			t.context.httpClient.post([urlPrefix, 'v1', 'bar'], {}, { error: true }),
		);
		t.is(err.status, 500);
		t.is(err.message, 'bar-error');
		t.is(err.context.srcError.stack, undefined, `Stack stay inside api`);

		// Call special route which fails with extendable error
		err = await t.throwsAsync(async () =>
			t.context.httpClient.post([urlPrefix, 'v2', 'bar'], {}, { error: true }),
		);
		t.is(err.status, 505);
		t.is(err.message, 'bar-extendable-error');
		t.deepEqual(err.context.srcError.context, {
			test: true,
			error: { message: 'sample-error', name: 'Error' },
		});
		t.is(err.context.srcError.stack, undefined, `Stack stay inside api`);
	});

	t.true(stderr.join(' ').includes('bar-extendable-error'), 'bar-extendable-error');
});

test.serial(
	'Call routes with error in development (error key)',
	async (t: ExecutionContext<TestContext>) => {
		await runBeforeTest(t, { nodeEnvValue: 'development' });
		// Call error with no message
		const err = await t.throwsAsync<N9Error>(async () =>
			t.context.httpClient.get([urlPrefix, 'bar-fail']),
		);
		t.is(err.status, 500);
		t.deepEqual(
			err.context.srcError,
			{
				code: 'unspecified-error',
				status: 500,
				context: {},
			},
			'response body should be a n9 error',
		);
	},
);

test.serial(
	'Call routes with error in production (no leak)',
	async (t: ExecutionContext<TestContext>) => {
		await runBeforeTest(t, { nodeEnvValue: 'production' });
		const { stderr } = await mockAndCatchStd(async () => {
			// Call special route which fails
			let err = await t.throwsAsync<N9Error>(async () =>
				t.context.httpClient.post([urlPrefix, 'v1', 'bar'], {}, { error: true }),
			);
			t.is(err.status, 500);
			t.deepEqual(
				err.context.srcError,
				{
					code: 'bar-error',
					status: 500,
					context: {},
					// no error key
				},
				'bar-error',
			);

			// Call special route which fails with extendable error
			err = await t.throwsAsync(async () =>
				t.context.httpClient.post([urlPrefix, 'v2', 'bar'], {}, { error: true }),
			);
			t.is(err.status, 505);
			t.deepEqual(
				err.context.srcError,
				{
					code: 'bar-extendable-error',
					status: 505,
					context: {
						test: true,
						error: {
							message: 'sample-error',
							name: 'Error',
						},
					},
					// no error key
				},
				'bar-extendable-error',
			);

			// Call 404
			err = await t.throwsAsync(async () => t.context.httpClient.get([urlPrefix, '404']));
			t.is(err.status, 404);
			t.deepEqual(
				err.context.srcError,
				{
					code: 'not-found',
					status: 404,
					context: {
						url: '/404',
					},
					// no error key
				},
				'not-found',
			);

			// Call error with no message
			err = await t.throwsAsync(async () => t.context.httpClient.get([urlPrefix, 'bar-fail']));
			t.is(err.status, 500);
			t.deepEqual(
				err.context.srcError,
				{
					code: 'unspecified-error',
					status: 500,
					context: {},
					// no error key
				},
				'unspecified-error',
			);
		});
		t.true(stderr.join(' ').includes('bar-extendable-error'), 'bar-extendable-error');
	},
);
