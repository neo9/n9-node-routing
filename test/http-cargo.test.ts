import test, { ExecutionContext } from 'ava';

import { HttpCargoBuilder } from '../src';
import { init, mockAndCatchStd, TestContext, urlPrefix } from './fixtures';

init('micro-cargo');

test('Call a route multiple times with HttpClient and cargo', async (t: ExecutionContext<TestContext>) => {
	const { result, stdout } = await mockAndCatchStd(async () => {
		const cargo = HttpCargoBuilder.BUILD<{ _id: string }>(
			{
				cargoType: 'cargo-test',
			},
			[urlPrefix, 'users', 'by-multiple-ids'],
			'ids',
		);

		const responseForSingleCall = await cargo.get('1');

		t.deepEqual<{ _id: string }, { _id: string }>(
			responseForSingleCall,
			{ _id: '1' },
			'id1 fetch first object',
		);
		return { cargo };
	});
	t.true(stdout[0].includes('/users/by-multiple-ids?ids=1'), 'Server received one call');

	const mockAndCatchStdResult = await mockAndCatchStd(async () => {
		const [id1, id2, id3, id4, id5, id6] = await Promise.all([
			result.cargo.get('1'),
			result.cargo.get('2'),
			result.cargo.get('3'),
			result.cargo.get('4'),
			result.cargo.get('5'),
			result.cargo.get('6'),
		]);
		t.deepEqual<{ _id: string }, { _id: string }>(id1, { _id: '1' }, 'id1 fetch first object');
		t.deepEqual<{ _id: string }, { _id: string }>(id2, { _id: '2' }, 'id2 fetch first object');
		t.deepEqual<{ _id: string }, { _id: string }>(id3, { _id: '3' }, 'id3 fetch first object');
		t.deepEqual<{ _id: string }, { _id: string }>(id4, { _id: '4' }, 'id2 fetch first object');
		t.deepEqual<{ _id: string }, { _id: string }>(id5, { _id: '5' }, 'id2 fetch first object');
		t.deepEqual<{ _id: string }, { _id: string }>(id6, { _id: '6' }, 'id1 fetch first object');
	});

	t.truthy(
		mockAndCatchStdResult.stdout[0].match(/\/users\/by-multiple-ids\?ids=[0-9](&ids=[0-9]){5}/),
		'Server received one call',
	);
});

test('Call a route multiple times with cargo, one item is not found', async (t: ExecutionContext<TestContext>) => {
	await mockAndCatchStd(async () => {
		const cargo = HttpCargoBuilder.BUILD<{ _id: string }>(
			{
				cargoType: 'cargo-test',
			},
			[urlPrefix, 'users', 'by-multiple-ids'],
			'ids',
		);

		const responseForSingleCall = await cargo.get('404');

		t.deepEqual<{ _id: string }, { _id: string }>(
			responseForSingleCall,
			undefined,
			'id404 should not be found',
		);

		const [id1, id2, id3, id404, id5, id6] = await Promise.all([
			cargo.get('1'),
			cargo.get('2'),
			cargo.get('3'),
			cargo.get('404'),
			cargo.get('5'),
			cargo.get('6'),
		]);

		t.deepEqual<{ _id: string }, { _id: string }>(id1, { _id: '1' }, 'id1 fetch first object');
		t.deepEqual<{ _id: string }, { _id: string }>(id2, { _id: '2' }, 'id2 fetch first object');
		t.deepEqual<{ _id: string }, { _id: string }>(id3, { _id: '3' }, 'id3 fetch first object');
		t.deepEqual<{ _id: string }, { _id: string }>(id404, undefined, 'id2 fetch first object');
		t.deepEqual<{ _id: string }, { _id: string }>(id5, { _id: '5' }, 'id2 fetch first object');
		t.deepEqual<{ _id: string }, { _id: string }>(id6, { _id: '6' }, 'id1 fetch first object');
	});
});

test('Call a route multiple times with cargo, throw on when item is not found', async (t: ExecutionContext<TestContext>) => {
	await mockAndCatchStd(async () => {
		const cargo = HttpCargoBuilder.BUILD<{ _id: string }>(
			{
				cargoType: 'cargo-test',
				throwOnEmptyValue: true,
			},
			[urlPrefix, 'users', 'by-multiple-ids'],
			'ids',
		);

		await t.throwsAsync(
			async () => {
				await Promise.all([
					cargo.get('1'),
					cargo.get('2'),
					cargo.get('3'),
					cargo.get('404'),
					cargo.get('5'),
					cargo.get('6'),
				]);
			},
			{
				message: 'cargo-http-cargo-test-value-not-found',
			},
			'throw with one item not found',
		);
	});
});
