import ava from 'ava';
import { join } from 'path';
import * as stdMock from 'std-mocks';

// tslint:disable-next-line:import-name
import N9NodeRouting from '../src';
import commons, { closeServer, defaultNodeRoutingConfOptions } from './fixtures/commons';

const microFoo = join(__dirname, 'fixtures/micro-json-controller/');
const print = commons.print;

ava('Acl usage with JSON Controller, check /routes', async (t) => {
	stdMock.use({ print });
	const { server } = await N9NodeRouting({
		path: microFoo,
		http: { port: 5575 },
		conf: defaultNodeRoutingConfOptions,
	});

	// Check acl on routes
	await commons.jsonHttpClient.get('http://localhost:5575/routes');
	const res = await commons.jsonHttpClient.get<any[]>('http://localhost:5575/routes');

	t.is(res.length, 3);

	const routesToCall = [];
	const route1 = res[0];
	t.is(route1.description, undefined);
	t.is(route1.method, 'post');
	t.is(route1.path, '/toto/foo');
	t.is(route1.acl.perms[0].action, 'createFoo');
	routesToCall.push(route1.path);

	const route2 = res[1];
	t.is(route2.description, undefined);
	t.is(route2.method, 'post');
	t.is(route2.path, '/tata');
	t.is(route2.acl.perms[0].action, 'createBar');
	routesToCall.push(route2.path);

	const route3 = res[2];
	t.is(route3.description, undefined);
	t.is(route3.method, 'post');
	t.is(route3.path, '/no-controller');
	t.is(route3.acl.perms[0].action, 'createFoo');
	routesToCall.push(route3.path);

	for (const routeToCall of routesToCall) {
		await t.notThrowsAsync(
			async () => await commons.jsonHttpClient.post(`http://localhost:5575${routeToCall}`),
			`call ${routeToCall}`,
		);
	}

	// Check logs
	stdMock.restore();
	stdMock.flush();
	// Close server
	await closeServer(server);
});
