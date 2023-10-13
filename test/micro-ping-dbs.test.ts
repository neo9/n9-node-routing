import ava, { ExecutionContext } from 'ava';
import { register } from 'prom-client';

import { init, mockAndCatchStd, TestContext, urlPrefix } from './fixtures';

const { runBeforeTest } = init(undefined, {
	avoidBeforeEachHook: true,
});

ava.beforeEach(() => {
	register.clear(); // clear prometheus register
});

for (const prometheusOption of [{}, undefined, { isEnabled: false }, { isEnabled: true }]) {
	ava(
		`Call ping with api connected to mongodb, prometheus options : ${JSON.stringify(
			prometheusOption,
		)}`,
		async (t: ExecutionContext<TestContext>) => {
			let isConnectedToDb = true;
			const pingDbs = [
				{
					name: 'MongoDB',
					thisArg: undefined as any,
					isConnected: (): boolean => isConnectedToDb,
				},
			];

			await runBeforeTest(t, {
				n9NodeRoutingOptions: {
					prometheus: prometheusOption,
					http: {
						ping: {
							dbs: pingDbs,
						},
					},
				},
			});

			await mockAndCatchStd(async () => {
				// Check /ping route
				const res = await t.context.httpClient.get<{ response: string }>([urlPrefix, 'ping']);
				t.is(res.response, 'pong-db');

				// Simulated DB connection closing
				isConnectedToDb = false;

				// Check /ping route
				await t.throwsAsync(
					async () => await t.context.httpClient.get<string>([urlPrefix, 'ping']),
					{
						message: 'db-MongoDB-unreachable',
					},
					'db not reachable',
				);
			});
		},
	);

	ava(
		`Call ping with api connected to 2 mongodb, prometheus options : ${JSON.stringify(
			prometheusOption,
		)}`,
		async (t: ExecutionContext<TestContext>) => {
			let isConnectedToDb = true;
			const pingDbs = [
				{
					name: 'MongoDB1',
					thisArg: undefined as any,
					isConnected: (): boolean => isConnectedToDb,
				},
				{
					name: 'MongoDB2',
					thisArg: undefined,
					isConnected: (): boolean => true,
				},
			];

			await runBeforeTest(t, {
				n9NodeRoutingOptions: {
					prometheus: prometheusOption,
					http: {
						ping: {
							dbs: pingDbs,
						},
					},
				},
			});

			// Check /ping route
			const res = await t.context.httpClient.get<{ response: string }>([urlPrefix, 'ping']);
			t.is(res.response, 'pong-dbs-2');

			isConnectedToDb = false;

			// Check /ping route
			await t.throwsAsync(
				async () => await t.context.httpClient.get<string>([urlPrefix, 'ping']),
				{
					message: 'db-MongoDB1-unreachable',
				},
				'db not reachable',
			);
		},
	);
}
