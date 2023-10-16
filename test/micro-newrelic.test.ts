import { N9Error } from '@neo9/n9-node-utils';
import test, { ExecutionContext } from 'ava';

import { init, TestContext, urlPrefix } from './fixtures';

const { runBeforeTest } = init('micro-newrelic', {
	avoidBeforeEachHook: true,
});

test('Init newrelic and send error event', async (t: ExecutionContext<TestContext>) => {
	// process.env.NEW_RELIC_LOG_ENABLED = 'true';
	// process.env.NEW_RELIC_LOG_LEVEL = 'debug';
	// process.env.NEW_RELIC_LOG = 'stdout';
	// process.env.NEW_RELIC_EXPLAIN_THRESHOLD = '1';
	await runBeforeTest(t, {
		n9NodeRoutingOptions: {
			apm: {
				newRelicOptions: {
					licenseKey: 'fake-license-key',
				},
			},
		},
	});

	t.truthy(
		t.context.stdout.find((line) =>
			line.includes('Enable NewRelic for app test-@neo9/n9-node-routing'),
		),
		'Enable NewRelic for app test-@neo9/n9-node-routing',
	);

	const res = await t.context.httpClient.post<any>([urlPrefix, 'v1', 'bar']);
	t.truthy(res.bar, 'foo');

	// Call special route which fails
	const err = await t.throwsAsync<N9Error>(async () =>
		t.context.httpClient.post([urlPrefix, 'v1', 'bar'], {}, { error: true }),
	);
	t.is(err.status, 505);
	t.is(err.message, 'bar-extendable-error');

	// can't be tested because it take several minutes to newrelic to stop
	// https://docs.newrelic.com/docs/apm/new-relic-apm/maintenance/disable-apm-agent/#node
	// t.truthy(
	// 	stdout.find((line) => line.includes('Agent state changed from stopped to starting.')),
	// 	'Agent state changed from stopped to starting.',
	// );
	// t.truthy(
	// 	stdout.find((line) =>
	// 		line.includes(
	// 			'The following modules were required before newrelic and are not being instrumented',
	// 		),
	// 	),
	// 	'The following modules were required before newrelic and are not being instrumented',
	// );
	// t.truthy(
	// 	stdout.find((line) => line.includes('"module":"express","framework":"Expressjs"')),
	// 	'"module":"express","framework":"Expressjs"',
	// );
	// t.truthy(
	// 	stdout.find((line) => line.includes('Error while sending error to newrelic')),
	// 	'Error while sending error to newrelic',
	// );
});

test("Init app without newrelic and check tracing enabled doesn't go wrong", async (t: ExecutionContext<TestContext>) => {
	// process.env.NEW_RELIC_LOG_ENABLED = 'true';
	// process.env.NEW_RELIC_LOG_LEVEL = 'debug';
	// process.env.NEW_RELIC_LOG = 'stdout';
	// process.env.NEW_RELIC_EXPLAIN_THRESHOLD = '1';
	await runBeforeTest(t);
	t.falsy(
		t.context.stdout.find((line) => line.includes('Enable NewRelic for app')),
		'Enable NewRelic for app',
	);
	// can't be tested because it take several minutes to newrelic to stop
	// https://docs.newrelic.com/docs/apm/new-relic-apm/maintenance/disable-apm-agent/#node
	// 		t.falsy(
	// 			stdout.find((line) => line.includes('Agent state changed from stopped to starting.')),
	// 			'Agent state changed from stopped to starting.',
	// 		);
	// 		t.falsy(
	// 			stdout.find((line) =>
	// 				line.includes(
	// 					'The following modules were required before newrelic and are not being instrumented',
	// 				),
	// 			),
	// 			'The following modules were required before newrelic and are not being instrumented',
	// 		);
	// 		t.falsy(
	// 			stdout.find((line) => line.includes('"module":"express","framework":"Expressjs"')),
	// 			'"module":"express","framework":"Expressjs"',
	// 		);
	// 		t.falsy(
	// 			stdout.find((line) => line.includes('Error while sending error to newrelic')),
	// 			'Error while sending error to newrelic',
	// 		);
});

test.afterEach(() => {
	for (const key of Object.keys(process.env)) {
		if (key.startsWith('NEW_RELIC_')) {
			delete process.env[key];
		}
	}
});
