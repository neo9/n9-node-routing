import { MongoUtils } from '@neo9/n9-mongo-client';
import { N9Log } from '@neo9/n9-node-log';
import ava, { Assertions } from 'ava';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { register } from 'prom-client';
import * as stdMock from 'std-mocks';

// tslint:disable-next-line:import-name
import N9NodeRouting from '../src';
import commons, { defaultNodeRoutingConfOptions } from './fixtures/commons';
import { end } from './fixtures/helper';

const print = commons.print;

ava.beforeEach(() => {
	delete (global as any).log;
	register.clear(); // clear prometheus register
});

for (const prometheusOption of [{}, undefined, { isEnabled: false }, { isEnabled: true }]) {
	ava(
		`Call ping with api connected to mongodb, prometheus options : ${JSON.stringify(
			prometheusOption,
		)}`,
		async (t: Assertions) => {
			stdMock.use({ print });

			const mongodServer = await MongoMemoryServer.create({
				binary: {
					version: '4.2.2',
				},
				// debug: true,
			});
			const mongoConnectionString = mongodServer.getUri();
			(global as any).log = new N9Log('test');
			await MongoUtils.connect(mongoConnectionString); // set global.dbClient

			const { prometheusServer, server } = await N9NodeRouting({
				http: { port: 5000 },
				prometheus: prometheusOption,
				conf: defaultNodeRoutingConfOptions,
			});

			// Check /ping route
			const res = await commons.jsonHttpClient.get<{ response: string }>(
				'http://localhost:5000/ping',
			);
			t.is(res.response, 'pong-db');

			// Close server
			await mongodServer.stop();

			// Check /ping route
			await t.throwsAsync(
				async () => await commons.jsonHttpClient.get<string>('http://localhost:5000/ping'),
				{
					message: 'db-unreachable',
				},
				'db not reachable',
			);

			await end(server, prometheusServer);
		},
	);

	ava(
		`Call ping with api connected to 2 mongodb, prometheus options : ${JSON.stringify(
			prometheusOption,
		)}`,
		async (t: Assertions) => {
			stdMock.use({ print });

			const mongodServer = await MongoMemoryServer.create({
				binary: {
					version: '4.2.2',
				},
				// debug: true,
			});
			const mongoConnectionString1 = mongodServer.getUri('db-1');
			const mongoConnectionString2 = mongodServer.getUri('db-2');
			(global as any).log = new N9Log('test');
			await MongoUtils.connect(mongoConnectionString1); // set global.dbClient
			const dbClient1 = (global as any).dbClient;
			await MongoUtils.connect(mongoConnectionString2); // set global.dbClient
			const dbClient2 = (global as any).dbClient;
			delete (global as any).dbClient;

			const pingDbs = [
				{
					name: 'MongoDB1',
					thisArg: dbClient1,
					isConnected: dbClient1.isConnected,
				},
				{
					name: 'MongoDB2',
					thisArg: dbClient2,
					isConnected: dbClient2.isConnected,
				},
			];

			const { prometheusServer, server } = await N9NodeRouting({
				http: {
					port: 5000,
					ping: {
						dbs: pingDbs,
					},
				},
				prometheus: prometheusOption,
				conf: defaultNodeRoutingConfOptions,
			});

			// Check /ping route
			const res = await commons.jsonHttpClient.get<{ response: string }>(
				'http://localhost:5000/ping',
			);
			t.is(res.response, 'pong-dbs-2');

			await mongodServer.stop();

			// Check /ping route
			await t.throwsAsync(
				async () => await commons.jsonHttpClient.get<string>('http://localhost:5000/ping'),
				{
					message: 'db-MongoDB1-unreachable',
				},
				'db not reachable',
			);

			// Close server
			await end(server, prometheusServer);
		},
	);
}
