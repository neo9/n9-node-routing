import { N9Log } from '@neo9/n9-node-log';
import { N9Error } from '@neo9/n9-node-utils';
import test, { Assertions } from 'ava';
import { Express } from 'express';
import { Server } from 'http';
import { join } from 'path';
import * as stdMock from 'std-mocks';

import n9NodeRouting, { N9HttpClient } from '../src';
import commons from './fixtures/commons';
import { User } from './fixtures/micro-users/models/users.models';

const closeServer = async (server: Server) => {
	return new Promise((resolve) => {
		server.close(resolve);
	});
};

async function init(): Promise<{ app: Express, server: Server, httpClient: N9HttpClient }> {
	stdMock.use({ print: commons.print });
	const MICRO_USERS = join(__dirname, 'fixtures/micro-users/');
	const { app, server } = await n9NodeRouting({
		path: MICRO_USERS,
	});
	const httpClient = new N9HttpClient(new N9Log('test'));
	return { app, server, httpClient };
}

const urlPrefix = 'http://localhost:5000';

async function end(server: Server): Promise<void> {
	stdMock.restore();
	stdMock.flush();
	// Close server
	await closeServer(server);
}
const context: { user?: User, session?: string } = {};

test('[USERS] POST /users => 200 with good params', async (t: Assertions) => {
	const { server, httpClient } = await init();
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
		userId: userCreated._id
	});
	await end(server);
});

test('[USERS] POST /users => 400 with wrong params', async (t: Assertions) => {
	const { server, httpClient } = await init();
	const errorThrown = await t.throwsAsync<N9Error>(async () => await httpClient.post([urlPrefix, 'users'], {
		firstName: 'Neo',
		email: 'newameil' + new Date().getTime() + '@test.com',
		password: 'azerty',
	}));
	t.is(errorThrown.status, 400, 'validate wrong => 400');
	t.is(errorThrown.message, 'BadRequestError', 'body code : BadRequestError');

	await end(server);
});

test('[USERS] POST /users => 409 with user already exists', async (t: Assertions) => {
	const { server, httpClient } = await init();
	const errorThrown = await t.throwsAsync<N9Error>(async () => await httpClient.post([urlPrefix, 'users'], {
		firstName: 'Neo',
		lastName: 'Nine',
		email: 'neo@neo9.fr',
		password: 'password-long',
	}));
	t.is(errorThrown.status, 409);
	t.is(errorThrown.message, 'user-already-exists');

	await end(server);
});

/*
** modules/users/
*/
test('[USERS] GET /users/:id => 404 with user not found', async (t: Assertions) => {
	const { server, httpClient } = await init();

	const headers = { session: JSON.stringify({ userId: context.user._id }) };
	const errorThrown = await t.throwsAsync<N9Error>(async () => await httpClient.get([urlPrefix, '/users/012345678901234567890123'], {}, headers));
	t.is(errorThrown.status, 404);
	t.is(errorThrown.message, 'user-not-found');

	await end(server);
});

test('[USERS] GET /users/:id => 200 with user found', async (t: Assertions) => {
	const { server, httpClient } = await init();

	const headers = { session: context.session };
	const userFetched = await httpClient.get<User>([urlPrefix, 'users', context.user._id], {}, headers);
	t.is(userFetched.email, context.user.email);

	await end(server);
});
