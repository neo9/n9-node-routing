import n9Log from '@neo9/n9-node-log';
import test, { Assertions } from 'ava';
import { Server } from "http";
import * as rp from 'request-promise-native';
import * as stdMock from 'std-mocks';

import routingControllerWrapper from '../src';

const closeServer = async (server: Server) => {
	return new Promise((resolve) => {
		server.close(resolve);
	});
};

test('Works with custom port', async (t: Assertions) => {
	stdMock.use();
	const { app, server } = await routingControllerWrapper({ http: { port: 4002 } });
	stdMock.restore();
	const output = stdMock.flush();

	t.true(output.stdout[0].includes('Listening on port 4002'));
	// Close server
	await closeServer(server);
});

test('Works with preventListen = true', async (t: Assertions) => {
	stdMock.use();
	const { app, server } = await routingControllerWrapper({ http: { port: 4002, preventListen: true } });
	stdMock.restore();
	const output = stdMock.flush();

	t.is(output.stdout.length, 0);
	t.is(output.stderr.length, 0);
	const err = await t.throws(rp('http://localhost:4200'));
	t.is(err.name, 'RequestError');
});

test('Works with custom log and should add a namespace', async (t: Assertions) => {
	const log = n9Log('custom');
	stdMock.use();
	const { app, server } = await routingControllerWrapper({ log });
	stdMock.restore();
	const output = stdMock.flush();
	t.true(output.stdout[0].includes('[custom:n9-node-routing] Listening on port 5000'));
	// Close server
	await closeServer(server);
});

test('Works without params', async (t: Assertions) => {
	stdMock.use();
	const { app, server } = await routingControllerWrapper();
	stdMock.restore();
	const output = stdMock.flush();
	t.true(output.stdout[0].includes('[n9-node-routing] Listening on port 5000'));
	// Close server
	await closeServer(server);
});

test('Should not log the requests http.logLevel=false', async (t: Assertions) => {
	stdMock.use();
	const { server } = await(routingControllerWrapper({
		http: { logLevel: false }
	}));
	await rp('http://localhost:5000/');
	await rp('http://localhost:5000/ping');
	await rp('http://localhost:5000/routes');
	stdMock.restore();
	const output = stdMock.flush();
	t.is(output.stdout.length, 1);
	// Close server
	await closeServer(server);
});

test('Should log the requests with custom level', async (t: Assertions) => {
	stdMock.use();
	const { server } = await(routingControllerWrapper({
		http: { logLevel: ':status :url' }
	}));
	await rp('http://localhost:5000/');
	await rp('http://localhost:5000/ping');
	await rp('http://localhost:5000/routes');
	stdMock.restore();
	const output = stdMock.flush();
	t.is(output.stdout.length, 4);
	t.true(output.stdout[1].includes('200 /'));
	t.true(output.stdout[2].includes('200 /ping'));
	t.true(output.stdout[3].includes('200 /routes'));
	// Close server
	await closeServer(server);
});

test('Fails with PORT without access', async (t: Assertions) => {
	stdMock.use();
	const err = await t.throws(routingControllerWrapper({ http: { port: 80 } }));
	stdMock.restore();
	stdMock.flush();
	t.true(err.message.includes('Port 80 requires elevated privileges'));
});

test('Fails with PORT already used', async (t: Assertions) => {
	stdMock.use();
	await routingControllerWrapper({ http: { port: 6000 } });
	const err = await t.throws(routingControllerWrapper({ http: { port: 6000 } }));
	stdMock.restore();
	const output = stdMock.flush();
	t.true(output.stdout[0].includes('Listening on port 6000'));
	t.true(err.message.includes('Port 6000 is already in use'));
});

test('Fails with PORT not in common range', async (t: Assertions) => {
	stdMock.use();
	const err = await t.throws(routingControllerWrapper({ http: { port: 10000000 } }));
	t.true(err.message.includes('port'));
	stdMock.restore();
	stdMock.flush();
});
