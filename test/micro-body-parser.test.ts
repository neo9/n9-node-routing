import { N9Log } from '@neo9/n9-node-log';
import ava, { Assertions } from 'ava';
import { join } from 'path';
import * as stdMock from 'std-mocks';

// tslint:disable-next-line:import-name
import N9NodeRouting, { N9HttpClient } from '../src';
import commons, { defaultNodeRoutingConfOptions } from './fixtures/commons';
import { end } from './fixtures/helper';

const print = commons.print;
const microBodyParser = join(__dirname, 'fixtures/micro-body-parser/');

ava.beforeEach(() => {
	delete (global as any).log;
});

ava('Can define body-parser limit', async (t: Assertions) => {
	stdMock.use({ print });
	const { server, prometheusServer } = await N9NodeRouting({
		http: {
			bodyParser: {
				limit: 5,
			},
		},
		conf: defaultNodeRoutingConfOptions,
	});
	stdMock.restore();

	await t.throwsAsync(
		async () =>
			await commons.jsonHttpClient.post<any>('http://localhost:5000/ping', {
				key: 'A body bigger thant 5 bytes',
			}),
		{
			message: 'PayloadTooLargeError',
		},
	);
	// Close server
	await end(server, prometheusServer);
});

ava('Limit max payload size reached for bodyparser (1024 kB)', async (t: Assertions) => {
	stdMock.use({ print: commons.print });
	const { server, prometheusServer } = await N9NodeRouting({
		hasProxy: true, // tell n9NodeRouting to parse `session` header
		path: microBodyParser,
		http: {
			port: 6001,
		},
		conf: defaultNodeRoutingConfOptions,
	});
	stdMock.flush();
	const httpClient = new N9HttpClient(new N9Log('test'));
	const longString = 'A very long string. '.repeat(100_000);

	await t.throwsAsync(
		async () => await httpClient.post<any>('http://localhost:6001/bar', { longString }),
		{
			message: 'PayloadTooLargeError',
		},
		'payload is too large',
	);

	// Close server
	await end(server, prometheusServer);
});

ava('Increase max payload size to bodyparser', async (t: Assertions) => {
	stdMock.use({ print: commons.print });
	const { server, prometheusServer } = await N9NodeRouting({
		hasProxy: true, // tell n9NodeRouting to parse `session` header
		path: microBodyParser,
		http: {
			port: 6001,
			bodyParser: {
				limit: '100000kb',
			},
		},
		conf: defaultNodeRoutingConfOptions,
	});
	stdMock.flush();
	const httpClient = new N9HttpClient(new N9Log('test'));

	/*
	 ** Test ping route
	 */
	const longString = 'A very long string. '.repeat(100_000);

	const rep = await httpClient.post<any>('http://localhost:6001/bar', { longString });
	t.deepEqual(rep, { longString });

	// Close server
	await end(server, prometheusServer);
});
