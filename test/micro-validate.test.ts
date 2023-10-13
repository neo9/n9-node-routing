import { N9Error } from '@neo9/n9-node-utils';
import test, { ExecutionContext } from 'ava';

import { init, mockAndCatchStd, TestContext, urlPrefix } from './fixtures';

init('micro-validate');

test('Check allowUnknown', async (t: ExecutionContext<TestContext>) => {
	await mockAndCatchStd(async () => {
		// Should not allow others keys
		const err = await t.throwsAsync<N9Error>(async () =>
			t.context.httpClient.post([urlPrefix, 'validate'], {
				bad: true,
				username: 'ok',
			}),
		);
		t.is(err.status, 400);
		t.true(
			err.context.srcError.context[0].constraints.whitelistValidation ===
				'property bad should not exist',
		);

		// Should not allow others keys
		let res = await t.context.httpClient.post<{ ok: boolean }>([urlPrefix, 'validate'], {
			username: 'ok',
		});
		t.true(res.ok);

		// Should allow others keys
		res = await t.context.httpClient.post<{ ok: boolean }>([urlPrefix, 'validate-allow-all'], {
			bad: true,
			username: 'ok',
		});
		t.true(res.ok);
	});
});

test('Check date parsing', async (t: ExecutionContext<TestContext>) => {
	await mockAndCatchStd(async () => {
		// Should not allow others keys
		const err = await t.throwsAsync<N9Error>(
			async () =>
				await t.context.httpClient.post([urlPrefix, 'validate'], {
					bad: true,
					username: 'ok',
				}),
		);
		t.is(err.status, 400);
		t.true(
			err.context.srcError.context[0].constraints.whitelistValidation ===
				'property bad should not exist',
		);

		// Should not allow others keys
		let res = await t.context.httpClient.post<{ ok: boolean }>([urlPrefix, 'validate'], {
			username: 'ok',
		});
		t.true(res.ok);

		// Should allow others keys
		res = await t.context.httpClient.post<{ ok: boolean }>([urlPrefix, 'validate-allow-all'], {
			bad: true,
			username: 'ok',
		});
		t.true(res.ok);

		// Should return { ok: true }
		res = await t.context.httpClient.post<{ ok: boolean }>([urlPrefix, 'parse-date'], {
			date: '2018-01-03',
			body: 'A message body sample',
		});
		t.deepEqual(res, { ok: true });
	});
});
