import { N9Error } from '@neo9/n9-node-utils';
import ava, { Assertions } from 'ava';
import { join } from 'path';
import * as stdMock from 'std-mocks';

// tslint:disable-next-line:import-name
import N9NodeRouting from '../src';
import commons, { closeServer } from './fixtures/commons';

const print = commons.print;
const microAuth = join(__dirname, 'fixtures/micro-auth-proxy/');

ava('Call session route (req.headers.session)', async (t: Assertions) => {
	stdMock.use({ print });

	const { server } = await N9NodeRouting({
		hasProxy: true, // tell n9NodeRouting to parse `session` header
		path: microAuth,
		http: { port: 6001 },
	});
	/*
	 ** Fails with no `session` header
	 */
	let err = await t.throwsAsync<N9Error>(async () =>
		commons.jsonHttpClient.get('http://localhost:6001/me'),
	);
	t.is(err.status, 401);
	t.is(err.message, 'session-required');
	/*
	 ** Fails with bad `session` header
	 */
	err = await t.throwsAsync<N9Error>(async () =>
		commons.jsonHttpClient.get(
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
		commons.jsonHttpClient.get(
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
	let res = await commons.jsonHttpClient.get(
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
	res = await commons.jsonHttpClient.get('http://localhost:6001/me-load');
	t.deepEqual(res, { session: false });
	/*
	 ** With `session` header and session: { type: 'load' }
	 */
	res = await commons.jsonHttpClient.get(
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
