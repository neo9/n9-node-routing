import { N9Error } from '@neo9/n9-node-utils';
import ava, { Assertions } from 'ava';

import { end, init, urlPrefix } from './fixtures/helper';
import { User } from './fixtures/micro-users/models/users.models';

const microUsersFolder = 'micro-users';

const context: { user?: User; session?: string } = {};

ava('[USERS] POST /users => 200 with good params', async (t: Assertions) => {
	const { server, httpClient } = await init(microUsersFolder);
	const userCreated = await httpClient.post<User>([urlPrefix, 'users'], {
		firstName: 'Neo',
		lastName: 'Nine',
		email: 'neo@neo9.fr',
		password: 'password-long',
	});
	t.is(userCreated.firstName, 'Neo');
	t.is(userCreated.lastName, 'Nine');
	t.is(userCreated.email, 'neo@neo9.fr');
	t.falsy(userCreated.password);

	// Add to context
	context.user = userCreated;
	context.session = JSON.stringify({
		userId: userCreated._id,
	});
	await end(server);
});

ava('[USERS] POST /users => 400 with wrong params', async (t: Assertions) => {
	const { server, httpClient } = await init(microUsersFolder);
	const errorThrown = await t.throwsAsync<N9Error>(
		async () =>
			await httpClient.post([urlPrefix, 'users'], {
				firstName: 'Neo',
				email: `new-email${new Date().getTime()}@test.com`,
				password: 'azerty',
			}),
	);
	t.is(errorThrown.status, 400, 'validate wrong => 400');
	t.is(errorThrown.message, 'BadRequestError', 'body code : BadRequestError');

	await end(server);
});

ava('[USERS] POST /users => 409 with user already exists', async (t: Assertions) => {
	const { server, httpClient } = await init(microUsersFolder);
	const errorThrown = await t.throwsAsync<N9Error>(
		async () =>
			await httpClient.post([urlPrefix, 'users'], {
				firstName: 'Neo',
				lastName: 'Nine',
				email: 'neo@neo9.fr',
				password: 'password-long',
			}),
	);
	t.is(errorThrown.status, 409);
	t.is(errorThrown.message, 'user-already-exists');

	await end(server);
});

/*
 ** modules/users/
 */
ava('[USERS] GET /users/:id => 404 with user not found', async (t: Assertions) => {
	const { server, httpClient } = await init(microUsersFolder);

	const headers = { session: JSON.stringify({ userId: context.user._id }) };
	const errorThrown = await t.throwsAsync<N9Error>(
		async () => await httpClient.get([urlPrefix, '/users/012345678901234567890123'], {}, headers),
	);
	t.is(errorThrown.status, 404);
	t.is(errorThrown.message, 'user-not-found');

	await end(server);
});

ava('[USERS] GET /users/:id => 200 with user found', async (t: Assertions) => {
	const { server, httpClient } = await init(microUsersFolder);

	const headers = { session: context.session };
	const userFetched = await httpClient.get<User>(
		[urlPrefix, 'users', context.user._id],
		{},
		headers,
	);
	t.is(userFetched.email, context.user.email);

	await end(server);
});
