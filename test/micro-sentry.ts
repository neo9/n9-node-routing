import { N9Log } from '@neo9/n9-node-log';
import { N9Error, waitFor } from '@neo9/n9-node-utils';
import * as Sentry from '@sentry/node';
import ava, { Assertions } from 'ava';
import * as stdMock from 'std-mocks';
import { end, init, urlPrefix } from './fixtures/helper';

ava.beforeEach(() => {
	delete (global as any).log;
});

ava('Init sentry and send error event', async (t: Assertions) => {
	const eventsSent: Sentry.Event[] = [];
	const { server, httpClient } = await init('micro-sentry', false, {
		sentry: {
			initOptions: {
				dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
				debug: true,
				beforeSend: (event: Sentry.Event, hint?: Sentry.EventHint) => {
					eventsSent.push(event);
					return event;
				},
			},
		},
	});

	const res = await httpClient.post<any>([urlPrefix, 'v1', 'bar']);
	t.truthy(res.bar, 'foo');

	// Call special route which fails
	const err = await t.throwsAsync<N9Error>(async () =>
		httpClient.post([urlPrefix, 'v1', 'bar'], {}, { error: true }),
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

	const { stdout } = stdMock.flush();
	t.truthy(
		stdout.find((line) => line.includes('Sentry tracing enabled')),
		'Sentry tracing interceptor is enabled',
	);
	t.truthy(
		stdout.find((line) => line.includes('Integration installed: Http')),
		'Sentry tracing is enabled : Integration installed: Http',
	);
	t.truthy(
		stdout.find((line) => line.includes('Integration installed: Express')),
		'Sentry tracing is enabled : Integration installed: Express',
	);

	// Close server
	await end(server);
});

ava('Init sentry as default and check tracing enabled', async (t: Assertions) => {
	process.env.SENTRY_DSN = 'https://examplePublicKey@o0.ingest.sentry.io/0';
	const { server } = await init('micro-sentry', false, {
		log: new N9Log('test', { level: 'debug' }),
	});
	const { stdout } = stdMock.flush();
	t.truthy(
		stdout.find((line) => line.includes('Sentry tracing enabled')),
		'Sentry tracing interceptor is enabled',
	);
	t.truthy(
		stdout.find((line) => line.includes('"tracesSampleRate":1')),
		'Sentry config is printed',
	);

	// Close server
	await end(server);
});

ava('Init sentry with conf override', async (t: Assertions) => {
	process.env.SENTRY_DSN = 'https://examplePublicKey@o0.ingest.sentry.io/0';
	const { server } = await init('micro-sentry', false, {
		log: new N9Log('test', { level: 'debug' }),
		sentry: {
			forceCustomOptions: true,
		},
	});
	const { stdout } = stdMock.flush();
	t.falsy(
		stdout.find((line) => line.includes('Sentry tracing enabled')),
		'Sentry tracing interceptor is enabled only by default',
	);
	t.truthy(
		stdout.find((line) => line.includes('"release"')),
		'Sentry config is printed',
	);
	t.falsy(
		stdout.find((line) => line.includes('"tracesSampleRate":1')),
		'Sentry config is printed, traceSampleRate is not set',
	);

	// Close server
	await end(server);
});

ava('Init sentry with conf missing DSN', async (t: Assertions) => {
	await t.throwsAsync(
		init('micro-sentry', false, {
			log: new N9Log('test', { level: 'debug' }),
			sentry: {},
		}),
		{ message: 'missing-sentry-dsn' },
		'No dsn provided, should throw error',
	);
});

ava.afterEach(() => {
	delete process.env.SENTRY_DSN;
});
