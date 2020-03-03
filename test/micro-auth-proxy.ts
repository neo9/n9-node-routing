import test, { Assertions } from 'ava';
import { join } from 'path';
import * as stdMock from 'std-mocks';

import N9NodeRouting from '../src';
import { N9Error } from '@neo9/n9-node-utils';
import c, { closeServer } from './fixtures/commons';

const print = c.print;
const MICRO_AUTH = join(__dirname, 'fixtures/micro-auth-proxy/');

test('Call session route (req.headers.session)', async (t: Assertions) => {
	stdMock.use({ print });

	const { server } = await N9NodeRouting({
		hasProxy: true, // tell n9NodeRouting to parse `session` header
		path: MICRO_AUTH,
		http: { port: 6001 },
	});
	/*
	 ** Fails with no `session` header
	 */
	let err = await t.throwsAsync<N9Error>(async () =>
		c.jsonHttpClient.get('http://localhost:6001/me'),
	);
	t.is(err.status, 401);
	t.is(err.message, 'session-required');
	/*
	 ** Fails with bad `session` header
	 */
	err = await t.throwsAsync<N9Error>(async () =>
		c.jsonHttpClient.get(
			'http://localhost:6001/me',
			{},
			{
				session: 'bad',
			},
		),
	);
	t.is(err.status, 401);
	t.is(err.message, 'session-header-is-invalid');
	/*
	 ** Fails with bad `session` header (no `userId`)
	 */
	err = await t.throwsAsync<N9Error>(async () =>
		c.jsonHttpClient.get(
			'http://localhost:6001/me',
			{},
			{
				session: JSON.stringify({ noUserId: true }),
			},
		),
	);
	t.is(err.status, 401);
	t.is(err.message, 'session-header-has-no-userId');
	/*
	 ** Good `session` header
	 */
	const session = { userId: 1, name: 'Bruce Wayne' };
	let res = await c.jsonHttpClient.get(
		'http://localhost:6001/me',
		{},
		{
			session: JSON.stringify(session),
		},
	);
	t.deepEqual(res, session);
	/*
	 ** No `session` header but session: { type: 'load' }
	 */
	res = await c.jsonHttpClient.get('http://localhost:6001/me-load');
	t.deepEqual(res, { session: false });
	/*
	 ** With `session` header and session: { type: 'load' }
	 */
	res = await c.jsonHttpClient.get(
		'http://localhost:6001/me-load',
		{},
		{
			session: JSON.stringify(session),
		},
	);
	t.deepEqual(res, session);
	// Clear stdout
	stdMock.restore();
	stdMock.flush();
	// Close server
	await closeServer(server);
});
