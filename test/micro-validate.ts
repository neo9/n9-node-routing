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

const MICRO_VALIDATE = join(__dirname, 'fixtures/micro-validate/');

test('Check allowUnkown', async (t: Assertions) => {
	stdMock.use();

	const { app, server } = await routingControllerWrapper({
		path: MICRO_VALIDATE,
		http: { port: 5585 }
	});
	// Should not allow others keys
	const err = await t.throws(rp({
		method: 'POST',
		uri: 'http://localhost:5585/validate',
		resolveWithFullResponse: true,
		body: {
			bad: true,
			username: 'ok'
		},
		json: true
	}));
	t.is(err.statusCode, 400);
	t.true(err.response.body.context[0].constraints.whitelistValidation === 'property bad should not exist');

	// Should not allow others keys
	let res = await rp({
		method: 'POST',
		uri: 'http://localhost:5585/validate',
		resolveWithFullResponse: true,
		body: {
			username: 'ok'
		},
		json: true
	});
	t.is(res.statusCode, 200);
	t.true(res.body.ok);

	// Should allow others keys
	res = await rp({
		method: 'POST',
		uri: 'http://localhost:5585/validate-allow-all',
		resolveWithFullResponse: true,
		body: {
			bad: true,
			username: 'ok'
		},
		json: true
	});
	t.is(res.statusCode, 200);
	t.true(res.body.ok);
	// Check logs
	stdMock.restore();
	const output = stdMock.flush();
	// Close server
	await closeServer(server);
});
