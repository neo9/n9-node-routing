import { N9Error } from '@neo9/n9-node-utils';
import ava, { Assertions } from 'ava';
import { join } from 'path';
import * as stdMock from 'std-mocks';

import src, { N9NodeRouting } from '../src';
import commons, { defaultNodeRoutingConfOptions } from './fixtures/commons';
import { end } from './fixtures/helper';

const microValidate = join(__dirname, 'fixtures/micro-validate/');

ava('Check allowUnkown', async (t: Assertions) => {
	stdMock.use({ print: commons.print });

	const { server, prometheusServer }: N9NodeRouting.ReturnObject = await src({
		path: microValidate,
		http: { port: 5585 },
		conf: defaultNodeRoutingConfOptions,
	});
	// Should not allow others keys
	const err = await t.throwsAsync<N9Error>(async () =>
		commons.jsonHttpClient.post('http://localhost:5585/validate', {
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
	let res = await commons.jsonHttpClient.post<{ ok: boolean }>('http://localhost:5585/validate', {
		username: 'ok',
	});
	t.true(res.ok);

	// Should allow others keys
	res = await commons.jsonHttpClient.post<{ ok: boolean }>(
		'http://localhost:5585/validate-allow-all',
		{
			bad: true,
			username: 'ok',
		},
	);
	t.true(res.ok);

	// Close server
	await end(server, prometheusServer);
});

ava('Check date parsing', async (t: Assertions) => {
	stdMock.use({ print: commons.print });

	const { server, prometheusServer } = await src({
		path: microValidate,
		http: { port: 5585 },
		conf: defaultNodeRoutingConfOptions,
	});
	// Should not allow others keys
	const err = await t.throwsAsync<N9Error>(
		async () =>
			await commons.jsonHttpClient.post('http://localhost:5585/validate', {
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
	let res = await commons.jsonHttpClient.post<{ ok: boolean }>('http://localhost:5585/validate', {
		username: 'ok',
	});
	t.true(res.ok);

	// Should allow others keys
	res = await commons.jsonHttpClient.post<{ ok: boolean }>(
		'http://localhost:5585/validate-allow-all',
		{
			bad: true,
			username: 'ok',
		},
	);
	t.true(res.ok);

	// Should return { ok: true }
	res = await commons.jsonHttpClient.post<{ ok: boolean }>('http://localhost:5585/parse-date', {
		date: '2018-01-03',
		body: 'A message body sample',
	});
	t.deepEqual(res, { ok: true });

	// Close server
	await end(server, prometheusServer);
});
