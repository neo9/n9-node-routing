import { join } from 'node:path';

import { N9Log } from '@neo9/n9-node-log';
import { N9Error } from '@neo9/n9-node-utils';
import test, { ExecutionContext } from 'ava';
import * as FormData from 'form-data';
import * as fs from 'fs';

import { N9HttpClient } from '../src';
import { init, mockAndCatchStd, TestContext, urlPrefix } from './fixtures';

init('micro-mock-http-responses');

test('Call a route with HttpClient', async (t: ExecutionContext<TestContext>) => {
	/*
	 ** Test ping route
	 */
	let rep = await t.context.httpClient.get<string>(
		[urlPrefix, 'ping'],
		{},
		{
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'x-request-id': 'test-request-id',
		},
		{
			responseType: 'text',
		},
	);
	t.is(rep, JSON.stringify({ response: 'pong' }));
	const repObject = await t.context.httpClient.get<{ response: string }>(
		[urlPrefix, 'ping'],
		{},
		{
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'x-request-id': 'test-request-id',
		},
		{
			responseType: 'json',
		},
	);
	t.deepEqual(repObject, { response: 'pong' });
	rep = await t.context.httpClient.raw<string>([urlPrefix, 'ping'], {
		method: 'get',
		responseType: 'text',
	});
	t.is(rep, JSON.stringify({ response: 'pong' }));

	let error = await t.throwsAsync<N9Error>(
		async () => await t.context.httpClient.post<string>([urlPrefix, 'ping']),
	);
	t.is(error.message, 'not-found', 'post not-found');

	error = await t.throwsAsync<N9Error>(
		async () => await t.context.httpClient.put<string>([urlPrefix, 'ping']),
	);
	t.is(error.message, 'not-found', 'put not-found');

	error = await t.throwsAsync<N9Error>(
		async () => await t.context.httpClient.delete<string>([urlPrefix, 'ping']),
	);
	t.is(error.message, 'not-found', 'delete not-found');

	error = await t.throwsAsync<N9Error>(
		async () => await t.context.httpClient.options<string>([urlPrefix, 'ping']),
	);
	t.is(error.message, 'not-found', 'options not-found');

	error = await t.throwsAsync<N9Error>(
		async () => await t.context.httpClient.patch<string>([urlPrefix, 'ping']),
	);
	t.is(error.message, 'not-found', 'patch not-found');

	error = await t.throwsAsync<N9Error>(
		async () => await t.context.httpClient.request<string>('post', [urlPrefix, 'ping']),
	);
	t.is(error.message, 'not-found', 'request not-found');

	error = await t.throwsAsync<N9Error>(
		async () => await t.context.httpClient.requestStream([urlPrefix, '404']),
	);
	t.is(error.status, 404, 'request stream not-found');

	error = await t.throwsAsync<N9Error>(
		async () =>
			await t.context.httpClient.raw<string>([urlPrefix, 'ping'], {
				method: 'post',
			}),
	);
	t.is(error.message, 'not-found', 'raw not-found');

	error = await t.throwsAsync<N9Error>(
		async () => await t.context.httpClient.get<string>('http://localhost:111111'),
	);
	t.is(error.message, 'ERR_INVALID_URL', 'address invalid');

	error = await t.throwsAsync<N9Error>(
		async () => await t.context.httpClient.get<string>('http://ww.cantconnecttothis.addres'),
	);
	t.is(error.message, 'ENOTFOUND', "can't resolve dns");
	t.is(error.status, 500);

	error = await t.throwsAsync<N9Error>(
		async () => await t.context.httpClient.get<string>('http://localhost:1'),
	);
	t.is(error.message, 'ECONNREFUSED', 'connection refused');
	t.is(error.status, 500);

	const { incomingMessage, responseAsStream } = await t.context.httpClient.requestStream([
		urlPrefix,
		'ping',
	]);
	t.is(incomingMessage.statusCode, 200, 'status code 200');

	let responseContent: string = null;
	await new Promise((resolve) => {
		responseAsStream
			.on('data', (data) => {
				responseContent = data.toString();
			})
			.on('end', resolve);
	});
	t.is(responseContent, JSON.stringify({ response: 'pong' }), 'response is pong');
});

test('Check retries of HttpClient', async (t: ExecutionContext<TestContext>) => {
	const httpClient = new N9HttpClient(
		new N9Log('test', {
			level: 'debug',
		}),
	);
	const { stdout, stderr } = await mockAndCatchStd(async () => {
		const error = await t.throwsAsync<N9Error>(
			async () => await httpClient.get<string>('http://localhost:1'),
		);
		t.is(error.message, 'ECONNREFUSED', 'connection refused');
		t.is(error.status, 500);
	});

	t.truthy(stdout?.length, 'stdout not empty');
	t.true(
		stdout[stdout.length - 1]?.includes(
			`Retry call [GET http://localhost:1/] n°2 due to ECONNREFUSED`, // 127.0.0.1:1
		),
		`Retry n°2 is logged by client | ${stdout[stdout.length - 1]}`,
	);
	t.true(
		stderr[stderr.length - 1].includes(`Error on [get http://localhost:1]`),
		`Fail is also logged by client`,
	);
});

test('Check retries of HttpClient against error controller', async (t: ExecutionContext<TestContext>) => {
	const { stdout, stderr } = await mockAndCatchStd(async () => {
		const error = await t.throwsAsync<N9Error>(
			async () => await t.context.httpClient.get<string>([urlPrefix, '503']),
		);
		t.is(error.message, 'an-error', 'connection refused');
		t.is(error.status, 503);
	});

	t.is(
		stderr.filter((line) => line.includes('An error occurred, client should retry')).length,
		3,
		`Count 3 calls, 1 + 2 retries`,
	);

	t.true(
		stdout[1].includes(
			`Retry call [GET ${urlPrefix}/503] n°1 due to ERR_NON_2XX_3XX_RESPONSE Response code 503 (Service Unavailable)`,
		),
		`Retry n°1 is logged by client | ${stdout[1]}`,
	);
	t.true(
		stdout
			.join('')
			.includes(
				`Retry call [GET ${urlPrefix}/503] n°2 due to ERR_NON_2XX_3XX_RESPONSE Response code 503 (Service Unavailable)`,
			),
		`Retry n°2 is logged by client | ${stdout.join('')}`,
	);
	t.true(
		stderr[stderr.length - 7].includes(`Error on [get ${urlPrefix}/503]`),
		`Fail is also logged by client`,
	);
});

test('Use HttpClient got base options', async (t: ExecutionContext<TestContext>) => {
	const httpClient = new N9HttpClient(new N9Log('test', { level: 'debug' }), {
		gotOptions: {
			headers: {
				test: 'something',
			},
		},
	});
	const rep = await httpClient.get<{ ok: boolean }>([urlPrefix, 'requires-header']);
	t.deepEqual(rep, { ok: true }, 'ok expected');
});

test('Use HttpClient with multiple queryParams', async (t: ExecutionContext<TestContext>) => {
	let rep = await t.context.httpClient.get<{ ids: string[] }>([urlPrefix, 'by-multiple-ids'], {
		ids: [1, 2, 3],
	});
	t.deepEqual(rep, { ids: ['1', '2', '3'] }, 'array with 3 values expected');

	rep = await t.context.httpClient.get<{ ids: string[] }>([urlPrefix, 'by-multiple-ids'], {
		ids: 1,
	});
	t.deepEqual(rep, { ids: ['1'] }, 'array with 1 value expected');
});

test('Use HttpClient to call route with response 204', async (t: ExecutionContext<TestContext>) => {
	const rep = await t.context.httpClient.get<object>([urlPrefix, 'empty-response']);
	t.is(rep, undefined, 'response is undefined');
});

test('Use HttpClient to upload a file', async (t: ExecutionContext<TestContext>) => {
	let body = new FormData();
	body.append(
		'file1',
		fs.createReadStream(join(__dirname, 'fixtures/micro-mock-http-responses/test.txt')),
		{
			filename: 'test.png',
			contentType: 'text/csv',
		},
	);
	let rep = await t.context.httpClient.raw([urlPrefix, 'files'], {
		body,
		method: 'post',
	});
	t.deepEqual(rep, { bytesWritten: 2020, size: 2020 }, 'response is filled with file infos');

	body = new FormData();
	body.append(
		'file1',
		fs.createReadStream(join(__dirname, 'fixtures/micro-mock-http-responses/test.txt')),
		{
			filename: 'test.png',
			contentType: 'text/csv',
		},
	);
	rep = await t.context.httpClient.raw([urlPrefix, 'files-no-response'], {
		body,
		method: 'post',
	});
	t.is(rep, undefined, 'response is undefined');
});

test('Use HttpClient to call route with numeric error code', async (t: ExecutionContext<TestContext>) => {
	const error = await t.throwsAsync<N9Error>(
		async () => await t.context.httpClient.get<string>([urlPrefix, 'numeric-error-code']),
	);
	t.is(error.message, '500', 'error code is not numerical');
});

test('Use HttpClient with default sensitive headers options', async (t: ExecutionContext<TestContext>) => {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const headers = { sensitive: 'sensitive', Authorization: '1111-2222-3333' };
	const httpClient = new N9HttpClient(new N9Log('test', { level: 'debug' }), {
		gotOptions: { headers },
	});

	let error = await t.throwsAsync<N9Error>(
		async () => await httpClient.request<string>('get', [urlPrefix, 'numeric-error-code']),
	);
	t.is(error.message, '500', 'error code is not numerical');
	t.like(
		error.context.headers,
		// eslint-disable-next-line @typescript-eslint/naming-convention
		{ sensitive: 'sensitive', Authorization: '1************3' },
		'Only Authorization is censored by default for requests',
	);

	error = await t.throwsAsync<N9Error>(
		async () =>
			await httpClient.raw<string>([urlPrefix, 'ping'], {
				method: 'post',
			}),
	);
	t.like(
		JSON.parse(error.context.options).headers,
		// eslint-disable-next-line @typescript-eslint/naming-convention
		{ sensitive: 'sensitive', Authorization: '1************3' },
		'Only Authorization is censored by default for raws',
	);

	error = await t.throwsAsync<N9Error>(
		async () => await httpClient.requestStream([urlPrefix, '404'], { headers }),
	);
	t.like(
		error.context.headers,
		// eslint-disable-next-line @typescript-eslint/naming-convention
		{ sensitive: 'sensitive', Authorization: '1************3' },
		'Only Authorization is censored by default for streams',
	);
});

test('Use HttpClient with custom sensitive headers options', async (t: ExecutionContext<TestContext>) => {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const headers = { sensitive: 'sensitive', Authorization: '1111-2222-3333' };
	const gotOptions = { headers };

	let httpClient = new N9HttpClient(new N9Log('test', { level: 'debug' }), {
		gotOptions,
		sensitiveHeadersOptions: {
			sensitiveHeaders: ['sensitive', 'otherSensitive', 'Authorization'],
		},
	});
	let error = await t.throwsAsync<N9Error>(
		async () => await httpClient.get<string>([urlPrefix, '/numeric-error-code']),
	);
	t.like(
		error.context.headers,
		// eslint-disable-next-line @typescript-eslint/naming-convention
		{ sensitive: 's*******e', Authorization: '1************3' },
		'Both sensitive and Authorization are censored',
	);

	const overridenHeaders = { otherSensitive: 'otherSensitive', clear: 'clear' };
	error = await t.throwsAsync<N9Error>(
		async () =>
			await httpClient.get<string>([urlPrefix, 'numeric-error-code'], undefined, overridenHeaders),
	);
	t.like(
		error.context.headers,
		{ clear: 'clear', otherSensitive: 'o************e' },
		'Only overidden headers are displayed and otherSensitive is opaque',
	);

	httpClient = new N9HttpClient(new N9Log('test', { level: 'debug' }), {
		gotOptions,
		sensitiveHeadersOptions: {
			sensitiveHeaders: ['sensitive'],
		},
	});
	error = await t.throwsAsync<N9Error>(
		async () => await httpClient.get<string>([urlPrefix, 'numeric-error-code']),
	);
	t.like(
		error.context.headers,
		// eslint-disable-next-line @typescript-eslint/naming-convention
		{ sensitive: 's*******e', Authorization: '1111-2222-3333' },
		'Only sensitive is censored',
	);

	httpClient = new N9HttpClient(new N9Log('test', { level: 'debug' }), {
		gotOptions,
		sensitiveHeadersOptions: {
			alteringFormat: /(?<=.{4})[^-]/g,
		},
	});
	error = await t.throwsAsync<N9Error>(
		async () => await httpClient.get<string>([urlPrefix, 'numeric-error-code']),
	);
	t.like(
		error.context.headers,
		// eslint-disable-next-line @typescript-eslint/naming-convention
		{ sensitive: 'sensitive', Authorization: '1111-****-****' },
		'Authorization should be censored partially',
	);

	httpClient = new N9HttpClient(new N9Log('test', { level: 'debug' }), {
		gotOptions,
		sensitiveHeadersOptions: {
			alterSensitiveHeaders: false,
		},
	});
	error = await t.throwsAsync<N9Error>(
		async () => await httpClient.get<string>([urlPrefix, 'numeric-error-code']),
	);
	t.like(
		error.context.headers,
		// eslint-disable-next-line @typescript-eslint/naming-convention
		{ sensitive: 'sensitive', Authorization: '1111-2222-3333' },
		'All headers are uncensored',
	);
});
