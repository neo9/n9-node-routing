// tslint:disable:ordered-imports
import { end, init, get, post, logErrorForHuman } from './fixtures/helper';
import { N9JSONStreamResponse } from '@neo9/n9-node-utils';
import ava, { ExecutionContext } from 'ava';
import { UserDetails, UserListItem } from './fixtures/micro-users2/users.models';

const context: any = {};

/*
 ** Start API
 */
ava.before('Start API', async () => {
	const { server } = await init('micro-users2', true);
	context.server = server;
});

ava('POST /users => 200 with good params', async (t: ExecutionContext) => {
	const { body, err } = await post<UserDetails>('/users', {
		firstName: 'Neo',
		lastName: 'Nine',
		email: 'neo@neo9.fr',
		password: 'password-long',
	});
	if (err) {
		logErrorForHuman(err);
	}
	t.falsy(err, 'Error is empty');
	t.regex(body._id, /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i, 'Good _id format');
	t.is(body.firstName, 'Neo');
	t.is(body.lastName, 'Nine');
	t.is(body.email, 'neo@neo9.fr');
	t.is(body.password, undefined);
	// Add to context
	context.user = body;
	context.session = JSON.stringify({
		userId: body._id,
	});
});

ava('POST /users => 400 with wrong params', async (t: ExecutionContext) => {
	const { err } = await post<UserDetails>('/users', {
		firstName: 'Neo',
		email: `newameil${new Date().getTime()}@test.com`,
		password: 'azerty',
	});
	t.is(err.status, 400, 'validate wrong => 400');
	t.is(err.context.srcError.code, 'BadRequestError', 'body code : BadRequestError');
});

ava('POST /users => 409 with user already exists', async (t: ExecutionContext) => {
	const { err } = await post('/users', {
		firstName: 'Neo',
		lastName: 'Nine',
		email: 'neo@neo9.fr',
		password: 'password-long',
	});
	t.is(err.status, 409);
	t.is(err.context.srcError.code, 'user-already-exists');
});

/*
 ** modules/users/
 */
ava('GET /users/:id => 404 with user not found', async (t: ExecutionContext) => {
	const headers = { session: context.session };
	const { err } = await get('/users/012345678901234567890123', 'json', {}, headers);
	t.is(err.status, 404);
	t.is(err.context.srcError.code, 'user-not-found');
});

ava('GET /users/:id => 200 with user found', async (t: ExecutionContext) => {
	const headers = { session: context.session };
	const { body } = await get<UserDetails>(`/users/${context.user._id}`, 'json', {}, headers);
	t.is(body.email, context.user.email);
});

ava('GET /users => 200 with 1 user', async (t: ExecutionContext) => {
	const headers = { session: context.session };
	const { body, err } = await get<N9JSONStreamResponse<UserListItem>>(
		`/users`,
		'json',
		{},
		headers,
	);
	if (err) {
		logErrorForHuman(err);
	}
	t.falsy(err);
	t.truthy(body);
	t.is(body.count, 1);
	t.is((body.items[0] as UserDetails).password, undefined, 'password is not in the userListItem');
});

ava('GET /users => 400 with page size too big', async (t: ExecutionContext) => {
	const headers = { session: context.session };
	const { err } = await get<N9JSONStreamResponse<UserListItem>>(
		`/users`,
		'json',
		{ size: 500 },
		headers,
	);
	t.is(err.status, 400);
});

/*
 ** Stop API
 */
ava.after('Stop server', async () => {
	await end(context.server);
});
