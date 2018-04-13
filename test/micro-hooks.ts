import { N9Log } from '@neo9/n9-node-log';
import test, { Assertions } from 'ava';
import { Express } from 'express';
import { Server } from 'http';
import { join } from 'path';
import * as rp from 'request-promise-native';
import * as stdMock from 'std-mocks';

import routingControllerWrapper from '../src';

const closeServer = async (server: Server) => {
	return new Promise((resolve) => {
		server.close(resolve);
	});
};

test('Call new route (imagine a proxy)', async (t: Assertions) => {
	stdMock.use();
	const { app, server } = await routingControllerWrapper({
		hasProxy: true, // tell routingControllerWrapper to parse `session` header
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
	const output = stdMock.flush();

	t.is(output.stdout.length, 3);
	t.true(output.stdout[0].includes('beforeRoutingControllerLaunchHook'));
	t.true(output.stdout[1].includes( 'afterRoutingControllerLaunchHook'));

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
