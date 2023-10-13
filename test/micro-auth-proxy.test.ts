import { N9Error } from '@neo9/n9-node-utils';
import ava, { ExecutionContext } from 'ava';

import { init, TestContext, urlPrefix } from './fixtures';

init('micro-auth-proxy', {
	n9NodeRoutingOptions: {
		hasProxy: true, // tell n9NodeRouting to parse `session` header
	},
});

ava('Call session route (req.headers.session)', async (t: ExecutionContext<TestContext>) => {
	/*
	 ** Fails with no `session` header
	 */
	let err = await t.throwsAsync<N9Error>(async () => t.context.httpClient.get([urlPrefix, 'me']));
	t.is(err.status, 401);
	t.is(err.message, 'session-required');
	/*
	 ** Fails with bad `session` header
	 */
	err = await t.throwsAsync<N9Error>(async () =>
		t.context.httpClient.get(
			[urlPrefix, 'me'],
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
		t.context.httpClient.get(
			[urlPrefix, 'me'],
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
	let res = await t.context.httpClient.get(
		[urlPrefix, 'me'],
		{},
		{
			session: JSON.stringify(session),
		},
	);
	t.deepEqual(res, session);
	/*
	 ** No `session` header but session: { type: 'load' }
	 */
	res = await t.context.httpClient.get([urlPrefix, 'me-load']);
	t.deepEqual(res, { session: false });
	/*
	 ** With `session` header and session: { type: 'load' }
	 */
	res = await t.context.httpClient.get(
		[urlPrefix, 'me-load'],
		{},
		{
			session: JSON.stringify(session),
		},
	);
	t.deepEqual(res, session);
});
