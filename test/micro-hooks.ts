import { N9Log } from '@neo9/n9-node-log';
import test, { Assertions } from 'ava';
import * as bodyParser from 'body-parser';
import { Express } from 'express';
import { Server } from 'http';
import { join } from "path";
import * as rp from 'request-promise-native';
import * as stdMock from 'std-mocks';

import n9NodeRouting, { N9HttpClient } from '../src';
import commons from './fixtures/commons';
const MICRO_HOOKS = join(__dirname, 'fixtures/micro-hooks/');

const closeServer = async (server: Server) => {
	return new Promise((resolve) => {
		server.close(resolve);
	});
};

test('Call new route (imagine a proxy)', async (t: Assertions) => {
	stdMock.use({ print: commons.print });
	const { app, server } = await n9NodeRouting({
		hasProxy: true, // tell n9NodeRouting to parse `session` header
		path: '/opt/null',
		http: {
			port: 6001,
			beforeRoutingControllerLaunchHook: async (expressApp: Express, log: N9Log) => {
				log.info('beforeRoutingControllerLaunchHook');
			},
			afterRoutingControllerLaunchHook: async (expressApp, log) => {
				log.info('afterRoutingControllerLaunchHook');
			}
		}
	});
	const output = stdMock.flush().stdout.filter((line) => !line.includes(':nest:'));

	t.is(output.length, 3);
	t.true(output[0].includes('beforeRoutingControllerLaunchHook'));
	t.true(output[1].includes( 'afterRoutingControllerLaunchHook'));

	/*
	** Test ping route
	*/
	const rep = await rp({
		method: 'GET',
		uri: 'http://localhost:6001/ping',
		resolveWithFullResponse: true,
		json: true
	});
	t.is(rep.statusCode, 200);
	t.is(rep.body, 'pong');

	// Clear stdout
	stdMock.restore();
	stdMock.flush();
	// Close server
	await closeServer(server);
});

test('Limit max payload size reached for bodyparser', async (t: Assertions) => {
	stdMock.use({ print: commons.print });
	const { app, server } = await n9NodeRouting({
		hasProxy: true, // tell n9NodeRouting to parse `session` header
		path: MICRO_HOOKS,
		http: {
			port: 6001,
		}
	});
	const output = stdMock.flush().stdout.filter((line) => !line.includes(':nest:'));

	const httpClient = new N9HttpClient(new N9Log('test'));
	const longString = 'A very long string. '.repeat(10000);

	await t.throwsAsync(async () => await httpClient.post<any>('http://localhost:6001/bar', {longString}), {
		message: 'PayloadTooLargeError'
	}, 'payload is too large');

	// Clear stdout
	stdMock.restore();
	stdMock.flush();
	// Close server
	await closeServer(server);
});

test('Increase max payload size to bodyparser', async (t: Assertions) => {
	stdMock.use({ print: commons.print });
	const { app, server } = await n9NodeRouting({
		hasProxy: true, // tell n9NodeRouting to parse `session` header
		path: MICRO_HOOKS,
		http: {
			port: 6001,
			beforeRoutingControllerLaunchHook: async (expressApp: Express, log: N9Log) => {
				expressApp.use(bodyParser.json({ limit:  '1024kb' }));
			}
		}
	});
	const output = stdMock.flush().stdout.filter((line) => !line.includes(':nest:'));

	const httpClient = new N9HttpClient(new N9Log('test'));

	/*
	** Test ping route
	*/
	const longString = 'A very long string. '.repeat(10000);

	const rep = await httpClient.post<any>('http://localhost:6001/bar', {longString});
	t.deepEqual(rep, { longString });

	// Clear stdout
	stdMock.restore();
	stdMock.flush();
	// Close server
	await closeServer(server);
});
