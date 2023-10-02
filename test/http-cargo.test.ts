import ava, { Assertions } from 'ava';
import { join } from 'path';
import * as stdMock from 'std-mocks';

// tslint:disable-next-line:import-name
import N9NodeRouting, { HttpCargoBuilder } from '../src';
import commons, { defaultNodeRoutingConfOptions } from './fixtures/commons';
import { end } from './fixtures/helper';

const print = commons.print;

ava('Call a route multiple times with HttpClient and cargo', async (t: Assertions) => {
	stdMock.use({ print });
	const { server, prometheusServer } = await N9NodeRouting({
		path: join(__dirname, 'fixtures/micro-cargo/'),
		http: {
			port: 6001,
		},
		conf: defaultNodeRoutingConfOptions,
	});
	const cargo = HttpCargoBuilder.BUILD<{ _id: string }>(
		{
			cargoType: 'cargo-test',
		},
		['http://localhost:6001', 'users', 'by-multiple-ids'],
		'ids',
	);

	const responseForSingleCall = await cargo.get('1');

	t.deepEqual<{ _id: string }, { _id: string }>(
		responseForSingleCall,
		{ _id: '1' },
		'id1 fetch first object',
	);
	let output = stdMock.flush().stdout.filter(commons.excludeSomeLogs);
	t.true(output[6].includes('/users/by-multiple-ids?ids=1'), 'Server received one call');

	const [id1, id2, id3, id4, id5, id6] = await Promise.all([
		cargo.get('1'),
		cargo.get('2'),
		cargo.get('3'),
		cargo.get('4'),
		cargo.get('5'),
		cargo.get('6'),
	]);

	t.deepEqual<{ _id: string }, { _id: string }>(id1, { _id: '1' }, 'id1 fetch first object');
	t.deepEqual<{ _id: string }, { _id: string }>(id2, { _id: '2' }, 'id2 fetch first object');
	t.deepEqual<{ _id: string }, { _id: string }>(id3, { _id: '3' }, 'id3 fetch first object');
	t.deepEqual<{ _id: string }, { _id: string }>(id4, { _id: '4' }, 'id2 fetch first object');
	t.deepEqual<{ _id: string }, { _id: string }>(id5, { _id: '5' }, 'id2 fetch first object');
	t.deepEqual<{ _id: string }, { _id: string }>(id6, { _id: '6' }, 'id1 fetch first object');
	output = stdMock.flush().stdout.filter(commons.excludeSomeLogs);
	t.truthy(
		output[0].match(/\/users\/by-multiple-ids\?ids=[0-9](&ids=[0-9]){5}/),
		'Server received one call',
	);

	await end(server, prometheusServer);
});

ava('Call a route multiple times with cargo, one item is not found', async (t: Assertions) => {
	stdMock.use({ print });
	const { server, prometheusServer } = await N9NodeRouting({
		path: join(__dirname, 'fixtures/micro-cargo/'),
		http: {
			port: 6001,
		},
		conf: defaultNodeRoutingConfOptions,
	});
	const cargo = HttpCargoBuilder.BUILD<{ _id: string }>(
		{
			cargoType: 'cargo-test',
		},
		['http://localhost:6001', 'users', 'by-multiple-ids'],
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

	await end(server, prometheusServer);
});

ava(
	'Call a route multiple times with cargo, throw on when item is not found',
	async (t: Assertions) => {
		stdMock.use({ print });
		const { server, prometheusServer } = await N9NodeRouting({
			path: join(__dirname, 'fixtures/micro-cargo/'),
			http: {
				port: 6001,
			},
			conf: defaultNodeRoutingConfOptions,
		});
		const cargo = HttpCargoBuilder.BUILD<{ _id: string }>(
			{
				cargoType: 'cargo-test',
				throwOnEmptyValue: true,
			},
			['http://localhost:6001', 'users', 'by-multiple-ids'],
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

		await end(server, prometheusServer);
	},
);
