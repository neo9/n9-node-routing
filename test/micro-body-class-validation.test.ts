import { N9Error } from '@neo9/n9-node-utils';
import ava, { Assertions } from 'ava';

import { end, init, urlPrefix } from './fixtures/helper';
import {
	User,
	UserFrontDetail,
	UserOtherDetail,
	UserType,
} from './fixtures/micro-body-class-validation/models/users.models';

const microUsersFolder = 'micro-body-class-validation';

ava('[USERS] POST /users => 400 with wrong params', async (t: Assertions) => {
	const { prometheusServer, server, httpClient } = await init(microUsersFolder, false, {
		enableLogFormatJSON: false,
	});
	const errorThrown = await t.throwsAsync<N9Error>(
		async () =>
			await httpClient.post([urlPrefix, 'users'], {
				type: UserType.FRONT,
				details: {
					ageInYears: 'not-a-number' as any, // << the error
				},
			} as User<UserFrontDetail>),
	);
	t.is(errorThrown.status, 400, 'validate wrong => 400');
	t.is(errorThrown.message, 'BadRequestError', 'body code : BadRequestError');

	const errorThrown2 = await t.throwsAsync<N9Error>(
		async () =>
			await httpClient.post([urlPrefix, 'users'], {
				type: UserType.OTHER,
				details: {
					anArray: ['string', { ageInYears: 5 }, 2],
				},
			} as User<UserOtherDetail>),
	);
	t.is(errorThrown2.status, 400, 'validate wrong => 400');
	t.is(errorThrown2.message, 'BadRequestError', 'body code : BadRequestError');
	t.deepEqual(
		errorThrown2.context.srcError.context[0].children[0].constraints,
		{ arrayValidator: 'anArray must be string | UserFrontDetail' },
		'body error is on anArray',
	);

	await end(server, prometheusServer);
});
