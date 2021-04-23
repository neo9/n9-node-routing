import { N9Error } from '@neo9/n9-node-utils';
import ava, { Assertions } from 'ava';
import * as stdMock from 'std-mocks';
import { end, init, urlPrefix } from './fixtures/helper';

ava.beforeEach(() => {
	delete (global as any).log;
});

ava('Init newrelic and send error event', async (t: Assertions) => {
	// process.env.NEW_RELIC_LOG_ENABLED = 'true';
	// process.env.NEW_RELIC_LOG_LEVEL = 'debug';
	// process.env.NEW_RELIC_LOG = 'stdout';
	// process.env.NEW_RELIC_EXPLAIN_THRESHOLD = '1';

	const { server, httpClient } = await init('micro-newrelic', false, {
		enableLogFormatJSON: false,
		apm: {
			newRelicOptions: {
				licenseKey: 'fake-license-key',
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

	let { stdout } = stdMock.flush();
	stdout = stdout.map((line) => line.toString());
	t.truthy(
		stdout.find((line) => line.includes('Enable NewRelic for app test-n9-node-routing')),
		'Enable NewRelic for app n9-node-routing',
	);
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

	// Close server
	await end(server);
});

ava(
	"Init app without newrelic and check tracing enabled doesn't go wrong",
	async (t: Assertions) => {
		// process.env.NEW_RELIC_LOG_ENABLED = 'true';
		// process.env.NEW_RELIC_LOG_LEVEL = 'debug';
		// process.env.NEW_RELIC_LOG = 'stdout';
		// process.env.NEW_RELIC_EXPLAIN_THRESHOLD = '1';

		const { server } = await init('micro-newrelic', false, {
			enableLogFormatJSON: false,
		});
		const { stdout } = stdMock.flush();
		t.falsy(
			stdout.find((line) => line.includes('Enable NewRelic for app n9-node-routing')),
			'Enable NewRelic for app test-n9-node-routing',
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

		// Close server
		await end(server);
	},
);

ava.afterEach(() => {
	for (const key of Object.keys(process.env)) {
		if (key.startsWith('NEW_RELIC_')) {
			delete process.env[key];
		}
	}
});
