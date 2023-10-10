import ava, { ExecutionContext } from 'ava';

import { init, TestContext, urlPrefix } from './fixtures';

const { runBeforeTest } = init('micro-body-parser', {
	avoidBeforeEachHook: true,
});
const longString = 'A very long string. '.repeat(100_000);

ava('Can define body-parser limit', async (t: ExecutionContext<TestContext>) => {
	await runBeforeTest(t, {
		n9NodeRoutingOptions: {
			http: {
				bodyParser: {
					limit: 5,
				},
			},
		},
	});

	await t.throwsAsync(
		async () =>
			await t.context.httpClient.post<any>([urlPrefix, '/ping'], {
				key: 'A body bigger than 5 bytes',
			}),
		{
			message: 'PayloadTooLargeError',
		},
	);
});

ava(
	'Limit max payload size reached for bodyparser (1024 kB)',
	async (t: ExecutionContext<TestContext>) => {
		await runBeforeTest(t);

		await t.throwsAsync(
			async () => await t.context.httpClient.post<any>([urlPrefix, '/bar'], { longString }),
			{
				message: 'PayloadTooLargeError',
			},
			'payload is too large',
		);
	},
);

ava('Increase max payload size to bodyparser', async (t: ExecutionContext<TestContext>) => {
	await runBeforeTest(t, {
		n9NodeRoutingOptions: {
			http: {
				bodyParser: {
					limit: '100000kb',
				},
			},
		},
	});

	const rep = await t.context.httpClient.post<any>([urlPrefix, '/bar'], { longString });
	t.deepEqual(rep, { longString });
});
