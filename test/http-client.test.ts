import { N9Log } from '@neo9/n9-node-log';
import { N9Error } from '@neo9/n9-node-utils';
import ava, { Assertions } from 'ava';
import * as FormData from 'form-data';
import * as fs from 'fs';
import { join } from 'path';
import * as stdMock from 'std-mocks';

// tslint:disable-next-line:import-name
import N9NodeRouting, { N9HttpClient } from '../src';
import commons, { defaultNodeRoutingConfOptions } from './fixtures/commons';
import { end } from './fixtures/helper';

const print = commons.print;

ava('Call a route with HttpClient', async (t: Assertions) => {
	stdMock.use({ print });
	const { server, prometheusServer } = await N9NodeRouting({
		hasProxy: true, // tell N9NodeRouting to parse `session` header
		http: {
			port: 6001,
		},
		conf: defaultNodeRoutingConfOptions,
	});
	stdMock.flush();

	const httpClient = new N9HttpClient(new N9Log('test'));

	/*
	 ** Test ping route
	 */
	let rep = await httpClient.get<string>(
		'http://localhost:6001/ping',
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
	const repObject = await httpClient.get<{ response: string }>(
		'http://localhost:6001/ping',
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
	rep = await httpClient.raw<string>('http://localhost:6001/ping', {
		method: 'get',
		responseType: 'text',
	});
	t.is(rep, JSON.stringify({ response: 'pong' }));

	let error = await t.throwsAsync<N9Error>(
		async () => await httpClient.post<string>('http://localhost:6001/ping'),
	);
	t.is(error.message, 'not-found', 'post not-found');

	error = await t.throwsAsync<N9Error>(
		async () => await httpClient.put<string>('http://localhost:6001/ping'),
	);
	t.is(error.message, 'not-found', 'put not-found');

	error = await t.throwsAsync<N9Error>(
		async () => await httpClient.delete<string>('http://localhost:6001/ping'),
	);
	t.is(error.message, 'not-found', 'delete not-found');

	error = await t.throwsAsync<N9Error>(
		async () => await httpClient.options<string>('http://localhost:6001/ping'),
	);
	t.is(error.message, 'not-found', 'options not-found');

	error = await t.throwsAsync<N9Error>(
		async () => await httpClient.patch<string>('http://localhost:6001/ping'),
	);
	t.is(error.message, 'not-found', 'patch not-found');

	error = await t.throwsAsync<N9Error>(
		async () => await httpClient.request<string>('post', ['http://localhost:6001', 'ping']),
	);
	t.is(error.message, 'not-found', 'request not-found');

	error = await t.throwsAsync<N9Error>(
		async () => await httpClient.requestStream(['http://localhost:6001', '404']),
	);
	t.is(error.status, 404, 'request stream not-found');

	error = await t.throwsAsync<N9Error>(
		async () =>
			await httpClient.raw<string>('http://localhost:6001/ping', {
				method: 'post',
			}),
	);
	t.is(error.message, 'not-found', 'raw not-found');

	error = await t.throwsAsync<N9Error>(
		async () => await httpClient.get<string>('http://localhost:111111'),
	);
	t.is(error.message, 'ERR_INVALID_URL', 'address invalid');

	error = await t.throwsAsync<N9Error>(
		async () => await httpClient.get<string>('http://ww.cantconnecttothis.addres'),
	);
	t.is(error.message, 'ENOTFOUND', "can't resolve dns");
	t.is(error.status, 500);

	error = await t.throwsAsync<N9Error>(
		async () => await httpClient.get<string>('http://localhost:1'),
	);
	t.is(error.message, 'ECONNREFUSED', 'connection refused');
	t.is(error.status, 500);

	const { incomingMessage, responseAsStream } = await httpClient.requestStream([
		'http://localhost:6001',
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

	await end(server, prometheusServer);
});

ava('Check retries of HttpClient', async (t: Assertions) => {
	stdMock.use({ print });
	const httpClient = new N9HttpClient(
		new N9Log('test', {
			level: 'debug',
		}),
	);
	const error = await t.throwsAsync<N9Error>(
		async () => await httpClient.get<string>('http://localhost:1'),
	);
	const { stdout, stderr } = stdMock.flush();

	t.is(error.message, 'ECONNREFUSED', 'connection refused');
	t.is(error.status, 500);
	t.truthy(stdout?.length, 'stdout not empty');
	t.true(
		stdout[stdout.length - 1]?.includes(
			`Retry call [GET http://localhost:1/] n°2 due to ECONNREFUSED connect ECONNREFUSED`, // 127.0.0.1:1
		),
		`Retry n°2 is logged by client`,
	);
	t.true(
		stderr[stderr.length - 1].includes(`Error on [get http://localhost:1]`),
		`Fail is also logged by client`,
	);
});

ava('Check retries of HttpClient against error controller', async (t: Assertions) => {
	stdMock.use({ print });
	const { server, prometheusServer } = await N9NodeRouting({
		hasProxy: true, // tell N9NodeRouting to parse `session` header
		path: join(__dirname, 'fixtures/micro-mock-http-responses'),
		http: {
			port: 6001,
		},
		conf: defaultNodeRoutingConfOptions,
	});

	const httpClient = new N9HttpClient(new N9Log('test', { level: 'debug' }));
	const error = await t.throwsAsync<N9Error>(
		async () => await httpClient.get<string>('http://localhost:6001/503'),
	);
	const { stdout, stderr } = stdMock.flush();

	t.is(error.message, 'an-error', 'connection refused');
	t.is(error.status, 503);
	t.is(
		stderr.filter((line) => line.includes('An error occurred, client should retry')).length,
		3,
		`Count 3 calls, 1 + 2 retries`,
	);
	t.true(
		stdout[7].includes(
			`Retry call [GET http://localhost:6001/503] n°1 due to ERR_NON_2XX_3XX_RESPONSE Response code 503 (Service Unavailable)`,
		),
		`Retry n°1 is logged by client`,
	);
	t.true(
		stdout[9].includes(
			`Retry call [GET http://localhost:6001/503] n°2 due to ERR_NON_2XX_3XX_RESPONSE Response code 503 (Service Unavailable)`,
		),
		`Retry n°2 is logged by client`,
	);
	t.true(
		stderr[stderr.length - 1].includes(`Error on [get http://localhost:6001/503]`),
		`Fail is also logged by client`,
	);
	await end(server, prometheusServer);
});

ava('Use HttpClient base options', async (t: Assertions) => {
	stdMock.use({ print });
	const { server, prometheusServer } = await N9NodeRouting({
		hasProxy: true, // tell N9NodeRouting to parse `session` header
		path: join(__dirname, 'fixtures/micro-mock-http-responses'),
		http: {
			port: 6001,
		},
		conf: defaultNodeRoutingConfOptions,
	});

	const httpClient = new N9HttpClient(new N9Log('test', { level: 'debug' }), {
		headers: {
			test: 'something',
		},
	});
	const rep = await httpClient.get<{ ok: boolean }>('http://localhost:6001/requires-header');
	t.deepEqual(rep, { ok: true }, 'ok expected');
	await end(server, prometheusServer);
});

ava('Use HttpClient with multiple queryParams', async (t: Assertions) => {
	stdMock.use({ print });
	const { server, prometheusServer } = await N9NodeRouting({
		hasProxy: true, // tell N9NodeRouting to parse `session` header
		path: join(__dirname, 'fixtures/micro-mock-http-responses'),
		http: {
			port: 6001,
		},
		conf: defaultNodeRoutingConfOptions,
	});

	const httpClient = new N9HttpClient(new N9Log('test', { level: 'debug' }));
	let rep = await httpClient.get<{ ids: string[] }>('http://localhost:6001/by-multiple-ids', {
		ids: [1, 2, 3],
	});
	t.deepEqual(rep, { ids: ['1', '2', '3'] }, 'array with 3 values expected');

	rep = await httpClient.get<{ ids: string[] }>('http://localhost:6001/by-multiple-ids', {
		ids: 1,
	});
	t.deepEqual(rep, { ids: ['1'] }, 'array with 1 value expected');

	await end(server, prometheusServer);
});

ava('Use HttpClient to call route with response 204', async (t: Assertions) => {
	stdMock.use({ print });
	const { server, prometheusServer } = await N9NodeRouting({
		hasProxy: true, // tell N9NodeRouting to parse `session` header
		path: join(__dirname, 'fixtures/micro-mock-http-responses'),
		http: {
			port: 6001,
		},
		conf: defaultNodeRoutingConfOptions,
	});

	const httpClient = new N9HttpClient(new N9Log('test', { level: 'debug' }));
	const rep = await httpClient.get<object>('http://localhost:6001/empty-response');
	t.is(rep, undefined, 'response is undefined');

	await end(server, prometheusServer);
});

ava('Use HttpClient to upload a file', async (t: Assertions) => {
	stdMock.use({ print });
	const { server, prometheusServer } = await N9NodeRouting({
		hasProxy: true, // tell N9NodeRouting to parse `session` header
		path: join(__dirname, 'fixtures/micro-mock-http-responses'),
		http: {
			port: 6001,
		},
		conf: defaultNodeRoutingConfOptions,
	});

	const httpClient = new N9HttpClient(new N9Log('test', { level: 'debug' }));
	let body = new FormData();
	body.append(
		'file1',
		fs.createReadStream(join(__dirname, 'fixtures/micro-mock-http-responses/test.txt')),
		{
			filename: 'test.png',
			contentType: 'text/csv',
		},
	);
	let rep = await httpClient.raw('http://localhost:6001/files', {
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
	rep = await httpClient.raw('http://localhost:6001/files-no-response', {
		body,
		method: 'post',
	});
	t.is(rep, undefined, 'response is undefined');

	await end(server, prometheusServer);
});

ava('Use HttpClient to call route with numeric error code', async (t: Assertions) => {
	stdMock.use({ print });
	const { server, prometheusServer } = await N9NodeRouting({
		hasProxy: true, // tell N9NodeRouting to parse `session` header
		path: join(__dirname, 'fixtures/micro-mock-http-responses'),
		http: {
			port: 6001,
		},
		conf: defaultNodeRoutingConfOptions,
	});

	const httpClient = new N9HttpClient(new N9Log('test', { level: 'debug' }));

	const error = await t.throwsAsync<N9Error>(
		async () => await httpClient.get<string>('http://localhost:6001/numeric-error-code'),
	);
	t.is(error.message, '500', 'error code is not numerical');

	await end(server, prometheusServer);
});
