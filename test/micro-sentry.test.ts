import { N9Error, waitFor } from '@neo9/n9-node-utils';
import * as Sentry from '@sentry/node';
import ava, { ExecutionContext } from 'ava';

import { init, TestContext, urlPrefix } from './fixtures';

const { runBeforeTest } = init('micro-sentry', {
	avoidBeforeEachHook: true,
	nodeEnvValue: 'development',
});

ava('Init sentry and send error event', async (t: ExecutionContext<TestContext>) => {
	const eventsSent: Sentry.Event[] = [];
	await runBeforeTest(t, {
		n9NodeRoutingOptions: {
			sentry: {
				initOptions: {
					dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
					debug: true,
					beforeSend: (event: Sentry.Event) => {
						eventsSent.push(event);
						return event;
					},
				},
			},
		},
	});

	const res = await t.context.httpClient.post<any>([urlPrefix, 'v1', 'bar']);
	t.truthy(res.bar, 'foo');

	// Call special route which fails
	const err = await t.throwsAsync<N9Error>(async () =>
		t.context.httpClient.post([urlPrefix, 'v1', 'bar'], {}, { error: true }),
	);
	t.is(err.status, 505);
	t.is(err.message, 'bar-extendable-error');

	await waitFor(100);

	t.is(eventsSent.length, 1, '1 event sent to Sentry');
	t.is(eventsSent[0].exception.values.length, 1, '1 exception value');
	t.is(
		eventsSent[0].exception.values[0].value,
		'bar-extendable-error',
		'error sent to sentry is bar-extendable-error',
	);
	t.is(eventsSent[0].transaction, 'POST /:version/bar', 'Path is well formatted');

	t.truthy(
		t.context.stdout.find((line) => line.includes('Sentry tracing enabled')),
		'Sentry tracing interceptor is enabled',
	);
	t.truthy(
		t.context.stdout.find((line) => line.includes('Integration installed: Http')),
		'Sentry tracing is enabled : Integration installed: Http',
	);
	t.truthy(
		t.context.stdout.find((line) => line.includes('Integration installed: Express')),
		'Sentry tracing is enabled : Integration installed: Express',
	);
});

ava(
	'Init sentry as default and check tracing enabled',
	async (t: ExecutionContext<TestContext>) => {
		process.env.SENTRY_DSN = 'https://examplePublicKey@o0.ingest.sentry.io/0';
		await runBeforeTest(t);
		t.truthy(
			t.context.stdout.find((line) => line.includes('Sentry tracing enabled')),
			'Sentry tracing interceptor is enabled',
		);
		t.truthy(
			t.context.stdout.find((line) => line.includes('"tracesSampleRate": 1')),
			'Sentry config is printed',
		);
	},
);

ava('Init sentry with conf override', async (t: ExecutionContext<TestContext>) => {
	process.env.SENTRY_DSN = 'https://examplePublicKey@o0.ingest.sentry.io/0';
	await runBeforeTest(t, {
		n9NodeRoutingOptions: {
			sentry: {
				forceCustomOptions: true,
			},
		},
	});
	t.falsy(
		t.context.stdout.find((line) => line.includes('Sentry tracing enabled')),
		'Sentry tracing interceptor is enabled only by default',
	);
	t.truthy(
		t.context.stdout.find((line) => line.includes('"release"')),
		'Sentry config is printed',
	);
	t.falsy(
		t.context.stdout.find((line) => line.includes('"tracesSampleRate":1')),
		'Sentry config is printed, traceSampleRate is not set',
	);
});

ava('Init sentry with conf missing DSN', async (t: ExecutionContext<TestContext>) => {
	await runBeforeTest(t, {
		n9NodeRoutingOptions: {
			sentry: {},
		},
		mockAndCatchStdOptions: {
			throwError: false,
		},
	});
	t.is(
		t.context.runBeforeTestError?.message,
		'missing-sentry-dsn',
		'No dsn provided, should throw error',
	);
});

ava.afterEach(() => {
	delete process.env.SENTRY_DSN;
});
