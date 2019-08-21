import { N9Log } from '@neo9/n9-node-log';
import { N9Error } from '@neo9/n9-node-utils';
import test, { Assertions } from 'ava';
import { getNamespace } from 'continuation-local-storage';
import { Server } from 'http';
import * as stdMock from 'std-mocks';

import N9NodeRouting, { N9HttpClient } from '../src';
import { RequestIdNamespaceName } from '../src/requestid';
import commons from './fixtures/commons';

const closeServer = async (server: Server) => {
	return new Promise((resolve) => {
		server.close(resolve);
	});
};
const print = commons.print;

const namespaceRequestId = getNamespace(RequestIdNamespaceName);
namespaceRequestId.run(() => {
	namespaceRequestId.set('requestId', 'ReQuEsTiD');
});

test('Call a route with HttpClient', async (t: Assertions) => {
	stdMock.use({ print });
	const { server } = await N9NodeRouting({
		hasProxy: true, // tell N9NodeRouting to parse `session` header
		path: '/opt/null',
		http: {
			port: 6001,
		},
	});
	stdMock.flush();

	const httpClient = new N9HttpClient(new N9Log('test'));

	/*
	** Test ping route
	*/
	let rep = await httpClient.get<string>('http://localhost:6001/ping', {}, {
		'x-request-id': 'test-request-id',
	});
	t.is(rep, 'pong');
	rep = await httpClient.raw<string>('http://localhost:6001/ping', { method: 'get' });
	t.is(rep, 'pong');

	let error = await t.throwsAsync<N9Error>(async () => await httpClient.post<string>('http://localhost:6001/ping'));
	t.is(error.message, 'not-found', 'post not-found');

	error = await t.throwsAsync<N9Error>(async () => await httpClient.put<string>('http://localhost:6001/ping')) as N9Error;
	t.is(error.message, 'not-found', 'put not-found');

	error = await t.throwsAsync<N9Error>(async () => await httpClient.delete<string>('http://localhost:6001/ping')) as N9Error;
	t.is(error.message, 'not-found', 'delete not-found');

	error = await t.throwsAsync<N9Error>(async () => await httpClient.options<string>('http://localhost:6001/ping')) as N9Error;
	t.is(error.message, 'not-found', 'options not-found');

	error = await t.throwsAsync<N9Error>(async () => await httpClient.patch<string>('http://localhost:6001/ping')) as N9Error;
	t.is(error.message, 'not-found', 'patch not-found');

	error = await t.throwsAsync<N9Error>(async () => await httpClient.request<string>('post', ['http://localhost:6001', 'ping']));
	t.is(error.message, 'not-found', 'request not-found');

	error = await t.throwsAsync<N9Error>(async () => await httpClient.requestStream(['http://localhost:6001', '404']));
	t.is(error.status, 404, 'request stream not-found');

	error = await t.throwsAsync<N9Error>(async () => await httpClient.raw<string>('http://localhost:6001/ping', {
		method: 'post',
	})) as N9Error;
	t.is(error.message, 'not-found', 'raw not-found');

	error = await t.throwsAsync<N9Error>(async () => await httpClient.get<string>('http://localhost:0'));
	t.is(error.status, 500);
	t.is(error.message, 'ECONNREFUSED');

	const { incomingMessage, responseAsStream } = await httpClient.requestStream(['http://localhost:6001', 'ping']);
	t.is(incomingMessage.statusCode, 200, 'status code 200');
	let responseContent: string = null;
	await new Promise(((resolve) => {
		responseAsStream
				.on('data', (data) => {
					responseContent = data.toString();
				})
				.on('end', resolve);
	}));
	t.is(responseContent, 'pong', 'reponse is pong');

	// Clear stdout
	stdMock.restore();
	stdMock.flush();
	// Close server
	await closeServer(server);
});
