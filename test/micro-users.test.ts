import { N9Error } from '@neo9/n9-node-utils';
import test, { ExecutionContext } from 'ava';

import { init, TestContext, urlPrefix } from './fixtures';
import { User } from './fixtures/micro-users/models/users.models';

init('micro-users');

test('[USERS] POST /users => 200 with good params', async (t: ExecutionContext<TestContext>) => {
	const userCreated = await t.context.httpClient.post<User>([urlPrefix, 'users'], {
		firstName: 'Neo',
		lastName: 'Nine',
		email: 'neo@neo9.fr',
		password: 'password-long',
	});
	t.is(userCreated.firstName, 'Neo');
	t.is(userCreated.lastName, 'Nine');
	t.is(userCreated.email, 'neo@neo9.fr');
	t.falsy(userCreated.password);
});

test('[USERS] POST /users => 400 with wrong params', async (t: ExecutionContext<TestContext>) => {
	const errorThrown = await t.throwsAsync<N9Error>(
		async () =>
			await t.context.httpClient.post([urlPrefix, 'users'], {
				firstName: 'Neo',
				email: `new-email${new Date().getTime()}@test.com`,
				password: 'azerty',
			}),
	);
	t.is(errorThrown.status, 400, 'validate wrong => 400');
	t.is(errorThrown.message, 'BadRequestError', 'body code : BadRequestError');
});

test('[USERS] POST /users => 409 with user already exists', async (t: ExecutionContext<TestContext>) => {
	const errorThrown = await t.throwsAsync<N9Error>(
		async () =>
			await t.context.httpClient.post([urlPrefix, 'users'], {
				firstName: 'Neo',
				lastName: 'Nine',
				email: 'neo@neo9.fr',
				password: 'password-long',
			}),
	);
	t.is(errorThrown.status, 409);
	t.is(errorThrown.message, 'user-already-exists');
});
test('[USERS] GET /users/:id => 404 with user not found', async (t: ExecutionContext<TestContext>) => {
	const userCreated = await t.context.httpClient.post<User>([urlPrefix, 'users'], {
		firstName: 'Neo',
		lastName: 'Neuf',
		email: 'neuf@neo9.fr',
		password: 'password-long',
	});

	const headers = { session: JSON.stringify({ userId: userCreated._id }) };
	const errorThrown = await t.throwsAsync<N9Error>(
		async () =>
			await t.context.httpClient.get([urlPrefix, '/users/012345678901234567890123'], {}, headers),
	);
	t.is(errorThrown.status, 404);
	t.is(errorThrown.message, 'user-not-found');
});

test('[USERS] GET /users/:id => 200 with user found', async (t: ExecutionContext<TestContext>) => {
	const userCreated = await t.context.httpClient.post<User>([urlPrefix, 'users'], {
		firstName: 'Neo',
		lastName: 'Neuf',
		email: 'neuf2@neo9.fr',
		password: 'password-long',
	});

	const headers = { session: JSON.stringify({ userId: userCreated._id }) };
	const userFetched = await t.context.httpClient.get<User>(
		[urlPrefix, 'users', userCreated._id],
		{},
		headers,
	);
	t.is(userFetched.email, userCreated.email);
});
