import { N9Error, waitFor } from '@neo9/n9-node-utils';
import ava, { ExecutionContext } from 'ava';

import { Cargo } from '../src';
import { mockAndCatchStd, TestContext } from './fixtures';

ava('Use a small cargo to compute data', async (t: ExecutionContext<TestContext>) => {
	await mockAndCatchStd(async () => {
		const cargo = new Cargo<{ v: number; newV: number }, { v: number }>(
			'simple-fct-cargo',
			async (requests) => {
				await waitFor(10); // add some delay to simulate async operation
				return requests.map((req) => ({ v: req.v, newV: req.v * 2 }));
			},
			(request, responses) => {
				return responses.find((rep) => rep.v === request.v);
			},
			false,
			5,
			1,
		);

		const [id1, id2, id3, id4, id5, id6] = await Promise.all([
			cargo.get({ v: 1 }),
			cargo.get({ v: 2 }),
			cargo.get({ v: 3 }),
			cargo.get({ v: 4 }),
			cargo.get({ v: 5 }),
			cargo.get({ v: 6 }),
		]);

		t.deepEqual<{ v: number; newV: number }, { v: number; newV: number }>(
			id1,
			{ v: 1, newV: 2 },
			'id1 fetch first object',
		);
		t.deepEqual<{ v: number; newV: number }, { v: number; newV: number }>(
			id2,
			{ v: 2, newV: 4 },
			'id2 fetch first object',
		);
		t.deepEqual<{ v: number; newV: number }, { v: number; newV: number }>(
			id3,
			{ v: 3, newV: 6 },
			'id3 fetch first object',
		);
		t.deepEqual<{ v: number; newV: number }, { v: number; newV: number }>(
			id4,
			{ v: 4, newV: 8 },
			'id2 fetch first object',
		);
		t.deepEqual<{ v: number; newV: number }, { v: number; newV: number }>(
			id5,
			{ v: 5, newV: 10 },
			'id2 fetch first object',
		);
		t.deepEqual<{ v: number; newV: number }, { v: number; newV: number }>(
			id6,
			{ v: 6, newV: 12 },
			'id1 fetch first object',
		);
	});
});

ava(
	'Use a small cargo to compute data with default dispatch function',
	async (t: ExecutionContext<TestContext>) => {
		await mockAndCatchStd(async () => {
			const cargo = new Cargo<{ _id: number; newV: number }, { id: number }>(
				'simple-fct-cargo',
				async (requests) => {
					await waitFor(10); // add some delay to simulate async operation
					return requests.map((req) => ({ _id: req.id, newV: req.id * 2 }));
				},
			);

			const [id1, id2, id3, id4, id5, id6] = await Promise.all([
				cargo.get({ id: 1 }),
				cargo.get({ id: 2 }),
				cargo.get({ id: 3 }),
				cargo.get({ id: 4 }),
				cargo.get({ id: 5 }),
				cargo.get({ id: 6 }),
			]);

			t.deepEqual<{ _id: number; newV: number }, { _id: number; newV: number }>(
				id1,
				{ _id: 1, newV: 2 },
				'id1 fetch first object',
			);
			t.deepEqual<{ _id: number; newV: number }, { _id: number; newV: number }>(
				id2,
				{ _id: 2, newV: 4 },
				'id2 fetch first object',
			);
			t.deepEqual<{ _id: number; newV: number }, { _id: number; newV: number }>(
				id3,
				{ _id: 3, newV: 6 },
				'id3 fetch first object',
			);
			t.deepEqual<{ _id: number; newV: number }, { _id: number; newV: number }>(
				id4,
				{ _id: 4, newV: 8 },
				'id2 fetch first object',
			);
			t.deepEqual<{ _id: number; newV: number }, { _id: number; newV: number }>(
				id5,
				{ _id: 5, newV: 10 },
				'id2 fetch first object',
			);
			t.deepEqual<{ _id: number; newV: number }, { _id: number; newV: number }>(
				id6,
				{ _id: 6, newV: 12 },
				'id1 fetch first object',
			);
		});
	},
);

ava('Simple cargo with error inside worker', async (t: ExecutionContext<TestContext>) => {
	await mockAndCatchStd(async () => {
		const cargo = new Cargo<{ v: number; newV: number }, { v: number }>(
			'simple-fct-cargo',
			// eslint-disable-next-line @typescript-eslint/require-await
			async () => {
				throw new N9Error('an-error', 500, {});
			},
			(request, responses) => {
				return responses.find((rep) => rep.v === request.v);
			},
			false,
			5,
			1,
		);

		await t.throwsAsync(
			async () => {
				await Promise.all([
					cargo.get({ v: 1 }),
					cargo.get({ v: 2 }),
					cargo.get({ v: 3 }),
					cargo.get({ v: 4 }),
					cargo.get({ v: 5 }),
					cargo.get({ v: 6 }),
				]);
			},
			{
				message: 'cargo-simple-fct-cargo-worker-error',
			},
			'throw error an-error',
		);
	});
});

ava('Simple cargo with error inside dispatch', async (t: ExecutionContext<TestContext>) => {
	await mockAndCatchStd(async () => {
		const cargo = new Cargo<{ v: number; newV: number }, { v: number }>(
			'simple-fct-cargo',
			async (requests) => {
				await waitFor(10); // add some delay to simulate async operation
				return requests.map((req) => ({ v: req.v, newV: req.v * 2 }));
			},
			(): { v: number; newV: number } => {
				throw new N9Error('an-error', 500, {});
			},
			false,
			5,
			1,
		);

		await t.throwsAsync(
			async () => {
				await Promise.all([
					cargo.get({ v: 1 }),
					cargo.get({ v: 2 }),
					cargo.get({ v: 3 }),
					cargo.get({ v: 4 }),
					cargo.get({ v: 5 }),
					cargo.get({ v: 6 }),
				]);
			},
			{
				message: 'cargo-simple-fct-cargo-dispatch-error',
			},
			'throw error an-error',
		);
	});
});
