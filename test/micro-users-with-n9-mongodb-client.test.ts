import ava, { ExecutionContext } from 'ava';

import { init, mockAndCatchStd, TestContext, urlPrefix } from './fixtures';
import { UserDetails } from './fixtures/micro-users-with-n9-mongodb-client/users.models';

const context: { user?: UserDetails; session?: string } = {};
init('micro-users-with-n9-mongodb-client', {
	startMongoDB: true,
});

ava('POST /users => 200 with good params', async (t: ExecutionContext<TestContext>) => {
	await mockAndCatchStd(async () => {
		const userDetails = await t.context.httpClient.post<UserDetails>([urlPrefix, `users`], {
			firstName: 'Neo',
			lastName: 'Nine',
			email: 'neo@neo9.fr',
			password: 'password-long',
		});

		t.regex(userDetails._id, /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i, 'Good _id format');
		t.is(userDetails.firstName, 'Neo');
		t.is(userDetails.lastName, 'Nine');
		t.is(userDetails.email, 'neo@neo9.fr');
		t.is(userDetails.password, undefined);

		// Add to context
		context.user = userDetails;
		context.session = JSON.stringify({
			userId: userDetails._id,
		});
	});
});
//
// ava('POST /users => 400 with wrong params', async (t: ExecutionContext<TestContext>) => {
// 	await mockAndCatchStd(async () => {
// 		const error: N9Error = await t.throwsAsync(
// 			t.context.httpClient.post<UserDetails>([urlPrefix, `users`], {
// 				firstName: 'Neo',
// 				email: `newameil${new Date().getTime()}@test.com`,
// 				password: 'azerty',
// 			}),
// 		);
// 		t.is(error.status, 400, 'validate wrong => 400');
// 		t.is(error.context.srcError.code, 'BadRequestError', 'body code : BadRequestError');
// 	});
// });
//
// ava('POST /users => 409 with user already exists', async (t: ExecutionContext<TestContext>) => {
// 	await mockAndCatchStd(async () => {
// 		const error: N9Error = await t.throwsAsync(
// 			t.context.httpClient.post<UserDetails>([urlPrefix, `users`], {
// 				firstName: 'Neo',
// 				lastName: 'Nine',
// 				email: 'neo@neo9.fr',
// 				password: 'password-long',
// 			}),
// 		);
// 		t.is(error.status, 409);
// 		t.is(error.context.srcError.code, 'user-already-exists');
// 	});
// });
// ava('GET /users/:id => 404 with user not found', async (t: ExecutionContext<TestContext>) => {
// 	const headers = { session: context.session };
// 	await mockAndCatchStd(async () => {
// 		const error: N9Error = await t.throwsAsync(
// 			t.context.httpClient.get([urlPrefix, `users`, `012345678901234567890123`], {}, headers),
// 		);
// 		t.is(error.status, 404);
// 		t.is(error.context.srcError.code, 'user-not-found');
// 	});
// });
//
// ava('GET /users/:id => 200 with user found', async (t: ExecutionContext<TestContext>) => {
// 	const headers = { session: context.session };
// 	await mockAndCatchStd(async () => {
// 		const userDetails = await t.context.httpClient.get<UserDetails>(
// 			[urlPrefix, `users`, context.user._id],
// 			{},
// 			headers,
// 		);
// 		t.is(userDetails.email, context.user.email);
// 	});
// });
//
// ava('GET /users => 200 with 1 user', async (t: ExecutionContext<TestContext>) => {
// 	const headers = { session: context.session };
// 	await mockAndCatchStd(async () => {
// 		const users = await t.context.httpClient.get<N9JSONStreamResponse<UserListItem>>(
// 			[urlPrefix, `users`],
// 			{},
// 			headers,
// 		);
// 		t.truthy(users);
// 		t.is(users.count, 1);
// 		t.is(
// 			(users.items[0] as UserDetails).password,
// 			undefined,
// 			'password is not in the userListItem',
// 		);
// 	});
// });
//
// ava('GET /users => 400 with page size too big', async (t: ExecutionContext<TestContext>) => {
// 	const headers = { session: context.session };
// 	await mockAndCatchStd(async () => {
// 		const error: N9Error = await t.throwsAsync(
// 			t.context.httpClient.get<N9JSONStreamResponse<UserListItem>>(
// 				[urlPrefix, `users`],
// 				{ size: 500 },
// 				headers,
// 			),
// 		);
// 		t.is(error.status, 400);
// 	});
// });
