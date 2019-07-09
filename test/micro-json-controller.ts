import test from 'ava';
import { Server } from 'http';
import { join } from 'path';
import * as rp from 'request-promise-native';
import * as stdMock from 'std-mocks';

import routingControllerWrapper from '../src';
import commons from './fixtures/commons';

const closeServer = async (server: Server) => {
	return new Promise((resolve) => {
		server.close(resolve);
	});
};

const MICRO_FOO = join(__dirname, 'fixtures/micro-json-controller/');

test('Acl usage with JSON Controller, check /routes', async (t) => {
	stdMock.use({ print: commons.print });
	const { server } = await routingControllerWrapper({
		path: MICRO_FOO,
		http: { port: 5575 }
	});

	// Check acl on routes
	const res = await rp({ uri: 'http://localhost:5575/routes', resolveWithFullResponse: true, json: true });

	t.is(res.statusCode, 200);
	t.is(res.body.length, 3);

	const routesToCall = [];
	const route1 = res.body[0];
	t.is(route1.description, undefined);
	t.is(route1.method, 'post');
	t.is(route1.path, '/toto/foo');
	t.is(route1.acl.perms[0].action, 'createFoo');
	routesToCall.push(route1.path);

	const route2 = res.body[1];
	t.is(route2.description, undefined);
	t.is(route2.method, 'post');
	t.is(route2.path, '/tata');
	t.is(route2.acl.perms[0].action, 'createBar');
	routesToCall.push(route2.path);

	const route3 = res.body[2];
	t.is(route3.description, undefined);
	t.is(route3.method, 'post');
	t.is(route3.path, '/no-controller');
	t.is(route3.acl.perms[0].action, 'createFoo');
	routesToCall.push(route3.path);

	for (const routeToCall of routesToCall) {
		await rp({ method: 'POST', uri: 'http://localhost:5575' + routeToCall, resolveWithFullResponse: true, json: true });
		t.is(res.statusCode, 200);
	}

	// Check logs
	stdMock.restore();
	stdMock.flush();
	// Close server
	await closeServer(server);
});
