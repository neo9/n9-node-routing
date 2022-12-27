import { N9Log } from '@neo9/n9-node-log';
import ava, { Assertions } from 'ava';
import * as bodyParser from 'body-parser';
import { join } from 'path';
import * as stdMock from 'std-mocks';

// tslint:disable-next-line:import-name
import N9NodeRouting, { N9HttpClient } from '../src';
import commons, { closeServer, defaultNodeRoutingConfOptions } from './fixtures/commons';

const microHooks = join(__dirname, 'fixtures/micro-hooks/');

ava('Call new route (imagine a proxy)', async (t: Assertions) => {
	stdMock.use({ print: commons.print });
	const { server } = await N9NodeRouting({
		hasProxy: true, // tell N9NodeRouting to parse `session` header
		path: '/opt/null',
		http: {
			port: 6001,
			beforeRoutingControllerLaunchHook: ({ log }) => {
				log.info('beforeRoutingControllerLaunchHook');
			},
			afterRoutingControllerLaunchHook: ({ log }) => {
				log.info('afterRoutingControllerLaunchHook');
			},
		},
		conf: defaultNodeRoutingConfOptions,
	});
	const output = stdMock.flush().stdout.filter(commons.excludeSomeLogs);

	t.is(output.length, 8);
	t.true(output[4].includes('beforeRoutingControllerLaunchHook'));
	t.true(output[5].includes('afterRoutingControllerLaunchHook'));

	/*
	 ** Test ping route
	 */
	const rep = await commons.jsonHttpClient.get<{ response: string }>('http://localhost:6001/ping');
	t.deepEqual(rep, { response: 'pong' });

	// Clear stdout
	stdMock.restore();
	stdMock.flush();
	// Close server
	await closeServer(server);
});

ava('Limit max payload size reached for bodyparser', async (t: Assertions) => {
	stdMock.use({ print: commons.print });
	const { server } = await N9NodeRouting({
		hasProxy: true, // tell n9NodeRouting to parse `session` header
		path: microHooks,
		http: {
			port: 6001,
		},
		conf: defaultNodeRoutingConfOptions,
	});
	stdMock.flush();
	const httpClient = new N9HttpClient(new N9Log('test'));
	const longString = 'A very long string. '.repeat(10000);

	await t.throwsAsync(
		async () => await httpClient.post<any>('http://localhost:6001/bar', { longString }),
		{
			message: 'PayloadTooLargeError',
		},
		'payload is too large',
	);

	// Clear stdout
	stdMock.restore();
	stdMock.flush();
	// Close server
	await closeServer(server);
});

ava('Increase max payload size to bodyparser', async (t: Assertions) => {
	stdMock.use({ print: commons.print });
	const { server } = await N9NodeRouting({
		hasProxy: true, // tell n9NodeRouting to parse `session` header
		path: microHooks,
		http: {
			port: 6001,
			beforeRoutingControllerLaunchHook: ({ expressApp }) => {
				expressApp.use(bodyParser.json({ limit: '1024kb' }));
			},
		},
		conf: defaultNodeRoutingConfOptions,
	});
	stdMock.flush();
	const httpClient = new N9HttpClient(new N9Log('test'));

	/*
	 ** Test ping route
	 */
	const longString = 'A very long string. '.repeat(10000);

	const rep = await httpClient.post<any>('http://localhost:6001/bar', { longString });
	t.deepEqual(rep, { longString });

	// Clear stdout
	stdMock.restore();
	stdMock.flush();
	// Close server
	await closeServer(server);
});
