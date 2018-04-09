import test, { Assertions } from 'ava';
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

const MICRO_FOO = join(__dirname, 'fixtures/micro-foo/');

test('Basic usage, create http server', async (t: Assertions) => {
	stdMock.use();
	const { app, server } = await routingControllerWrapper({
		path: MICRO_FOO
	});
	// Check /foo route added on foo/foo.init.ts
	let res = await rp({ uri: 'http://localhost:5000/foo', resolveWithFullResponse: true, json: true });
	t.is(res.statusCode, 200);
	t.is(res.body.foo, 'bar');

	// Check / route
	res = await rp({ uri: 'http://localhost:5000/', resolveWithFullResponse: true });
	t.is(res.statusCode, 200);
	t.is(res.body, 'routing-controllers-wrapper');

	// Check /ping route
	res = await rp({ uri: 'http://localhost:5000/ping', resolveWithFullResponse: true });
	t.is(res.statusCode, 200);
	t.is(res.body, 'pong');

	// Check /404 route
	res = await t.throws(rp({ uri: 'http://localhost:5000/404', resolveWithFullResponse: true, json: true }));
	t.is(res.statusCode, 404);
	t.is(res.response.body.code, 'not-found');
	t.is(res.response.body.error.status, 404);
	t.is(res.response.body.error.context.url, '/404');

	// Check logs
	stdMock.restore();
	const output = stdMock.flush();

	// Logs on stdout
	t.true(output.stdout[0].includes('Init module bar'));
	t.true(output.stdout[1].includes('Init module foo'));
	t.true(output.stdout[2].includes('Hello foo.init'));
	t.true(output.stdout[3].includes('Listening on port 5000'));
	t.true(output.stdout[4].includes('GET /foo'));
	t.true(output.stdout[5].includes('GET /'));
	t.true(output.stdout[6].includes('GET /ping'));
	t.true(output.stdout[7].includes('Error: not-found'));
	t.true(output.stdout[8].includes('GET /404'));

	// Close server
	await closeServer(server);
});

test('Check /routes', async (t) => {
	stdMock.use();
	const { app, server } = await routingControllerWrapper({
		path: MICRO_FOO,
		http: { port: 5575 }
	});

	// Check acl on routes
	const res = await rp({ uri: 'http://localhost:5575/routes', resolveWithFullResponse: true, json: true });

	t.is(res.statusCode, 200);
	t.is(res.body.length, 1);

	const route1 = res.body[0];
	t.is(route1.description, undefined);
	t.is(route1.method, 'get');
	t.is(route1.path, '/foo');
	t.is(route1.acl.perms[0].action, 'readFoo');

	// Check logs
	stdMock.restore();
	const output = stdMock.flush();
	// Close server
	await closeServer(server);
});

test('Call routes (versionning)', async (t: Assertions) => {
	stdMock.use();
	const { app, server } = await routingControllerWrapper({
		path: MICRO_FOO,
		http: { port: 5559 }
	});
	let res = await rp({
		method: 'POST',
		uri: 'http://localhost:5559/v1/bar',
		body: {},
		resolveWithFullResponse: true,
		json: true
	});
	t.is(res.statusCode, 200);
	t.is(res.body.bar, 'foo');

	// Call /v1/fou
	res = await rp({
		method: 'POST',
		uri: 'http://localhost:5559/v1/fou',
		body: { hi: 'hello' },
		resolveWithFullResponse: true,
		json: true
	});
	t.is(res.statusCode, 200);
	t.deepEqual(res.body, { hi: 'hello' });

	// Call special route which fails
	let err = await t.throws(rp({
		method: 'POST',
		uri: 'http://localhost:5559/v1/bar',
		qs: { error: true },
		body: {},
		resolveWithFullResponse: true,
		json: true
	}));
	t.is(err.statusCode, 500);
	t.is(err.response.body.code, 'bar-error');

	// Call special route which fails with extendable error
	err = await t.throws(rp({
		method: 'POST',
		uri: 'http://localhost:5559/v2/bar',
		qs: { error: true },
		body: {},
		resolveWithFullResponse: true,
		json: true
	}));
	t.is(err.statusCode, 505);
	t.is(err.response.body.code, 'bar-extendable-error');
	t.is(err.response.body.status, 505);
	t.deepEqual(err.response.body.context, { test: true });
	stdMock.restore();
	const output = stdMock.flush();
	t.true(output.stderr.join(' ').includes('Error: bar-extendable-error'));
	// Close server
	await closeServer(server);
});

test('Call routes with error in development (error key)', async (t: Assertions) => {
	stdMock.use();
	const { app, server } = await routingControllerWrapper({
		path: MICRO_FOO,
		http: { port: 5587 }
	});
	// Call error with no message
	const err = await t.throws(rp({
		method: 'GET',
		uri: 'http://localhost:5587/bar-fail',
		resolveWithFullResponse: true,
		json: true
	}));
	t.is(err.statusCode, 500);
	t.deepEqual(err.response.body, {
		code: 'unspecified-error',
		status: 500,
		context: {},
	});
	stdMock.restore();
	stdMock.flush();
	// Close server
	await closeServer(server);
});

test('Call routes with error in production (no leak)', async (t: Assertions) => {
	process.env.NODE_ENV = 'production';
	stdMock.use();
	const { app, server } = await routingControllerWrapper({
		path: MICRO_FOO,
		http: { port: 5587 }
	});

	// Call special route which fails
	let err = await t.throws(rp({
		method: 'POST',
		uri: 'http://localhost:5587/v1/bar',
		qs: { error: true },
		body: {},
		resolveWithFullResponse: true,
		json: true
	}));
	t.is(err.statusCode, 500);
	t.deepEqual(err.response.body, {
		code: 'bar-error',
		status: 500,
		context: {},
		// no error key
	});

	// Call special route which fails with extendable error
	err = await t.throws(rp({
		method: 'POST',
		uri: 'http://localhost:5587/v2/bar',
		qs: { error: true },
		body: {},
		resolveWithFullResponse: true,
		json: true
	}));
	t.is(err.statusCode, 505);
	t.deepEqual(err.response.body, {
		code: 'bar-extendable-error',
		status: 505,
		context: {
			test: true
		},
		// no error key
	});

	// Call 404
	err = await t.throws(rp({
		method: 'GET',
		uri: 'http://localhost:5587/404',
		resolveWithFullResponse: true,
		json: true
	}));
	t.is(err.statusCode, 404);
	t.deepEqual(err.response.body, {
		code: 'not-found',
		status: 404,
		context: {
			url: '/404'
		},
		// no error key
	});

	// Call error with no message
	err = await t.throws(rp({
		method: 'GET',
		uri: 'http://localhost:5587/bar-fail',
		resolveWithFullResponse: true,
		json: true
	}));
	t.is(err.statusCode, 500);
	t.deepEqual(err.response.body, {
		code: 'unspecified-error',
		status: 500,
		context: {},
		// no error key
	});
	stdMock.restore();
	const output = stdMock.flush();
	t.true(output.stderr.join(' ').includes('Error: bar-extendable-error'));
	// Close server
	await closeServer(server);
	delete process.env.NODE_ENV;
});
