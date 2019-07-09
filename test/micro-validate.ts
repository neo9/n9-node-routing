import test, { Assertions } from 'ava';
import { Server } from 'http';
import { join } from 'path';
import * as rp from 'request-promise-native';
import { StatusCodeError } from 'request-promise-native/errors';
import * as stdMock from 'std-mocks';

import N9NodeRouting from '../src';
import commons from './fixtures/commons';

const closeServer = async (server: Server) => {
	return new Promise((resolve) => {
		server.close(resolve);
	});
};

const MICRO_VALIDATE = join(__dirname, 'fixtures/micro-validate/');

test('Check allowUnkown', async (t: Assertions) => {
	stdMock.use({ print: commons.print });

	const { server } = await N9NodeRouting({
		path: MICRO_VALIDATE,
		http: { port: 5585 },
	});
	// Should not allow others keys
	const err = await t.throwsAsync<StatusCodeError>(async () => rp({
		method: 'POST',
		uri: 'http://localhost:5585/validate',
		resolveWithFullResponse: true,
		body: {
			bad: true,
			username: 'ok',
		},
		json: true,
	}));
	t.is(err.statusCode, 400);
	t.true(err.response.body.context[0].constraints.whitelistValidation === 'property bad should not exist');

	// Should not allow others keys
	const res = await rp({
		method: 'POST',
		uri: 'http://localhost:5585/validate',
		resolveWithFullResponse: true,
		body: {
			username: 'ok',
		},
		json: true,
	});
	t.is(res.statusCode, 201);
	t.true(res.body.ok);

	// Can't be done with nest
	// // Should allow others keys
	// res = await rp({
	// 	method: 'POST',
	// 	uri: 'http://localhost:5585/validate-allow-all',
	// 	resolveWithFullResponse: true,
	// 	body: {
	// 		bad: true,
	// 		username: 'ok',
	// 	},
	// 	json: true,
	// });
	// t.is(res.statusCode, 200);
	// t.true(res.body.ok);
	// Check logs
	stdMock.restore();
	stdMock.flush();
	// Close server
	await closeServer(server);
});

test('Check date parsing', async (t: Assertions) => {
	stdMock.use({ print: commons.print });

	const { server } = await N9NodeRouting({
		path: MICRO_VALIDATE,
		http: { port: 5585 },
	});
	// Should not allow others keys
	const err = await t.throwsAsync<StatusCodeError>(async () => rp({
		method: 'POST',
		uri: 'http://localhost:5585/validate',
		resolveWithFullResponse: true,
		body: {
			bad: true,
			username: 'ok',
		},
		json: true,
	}));
	t.is(err.statusCode, 400);
	t.true(err.response.body.context[0].constraints.whitelistValidation === 'property bad should not exist');

	// Should not allow others keys
	let res = await rp({
		method: 'POST',
		uri: 'http://localhost:5585/validate',
		resolveWithFullResponse: true,
		body: {
			username: 'ok',
		},
		json: true,
	});
	t.is(res.statusCode, 201);
	t.true(res.body.ok);

	// Can't be done with nest
	// // Should allow others keys
	// res = await rp({
	// 	method: 'POST',
	// 	uri: 'http://localhost:5585/validate-allow-all',
	// 	resolveWithFullResponse: true,
	// 	body: {
	// 		bad: true,
	// 		username: 'ok',
	// 	},
	// 	json: true,
	// });
	// t.is(res.statusCode, 200);
	// t.true(res.body.ok);

	// Should return { ok: true }
	res = await rp({
		method: 'POST',
		uri: 'http://localhost:5585/parse-date',
		resolveWithFullResponse: true,
		body: {
			date: '2018-01-03',
			body: 'A message body sample',
		},
		json: true,
	});
	t.is(res.statusCode, 201);
	t.deepEqual(res.body, { ok: true });

	// Check logs
	stdMock.restore();
	stdMock.flush();
	// Close server
	await closeServer(server);
});
