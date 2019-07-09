import n9Log from '@neo9/n9-node-log';
import test, { Assertions } from 'ava';
import { Server } from 'http';
import * as rp from 'request-promise-native';
import * as stdMock from 'std-mocks';
import commons from './fixtures/commons';

import N9NodeRouting from '../src';

const closeServer = async (server: Server) => {
	return new Promise((resolve) => {
		server.close(resolve);
	});
};
const print = commons.print;

test.beforeEach(() => {
	delete global.log;
});

test('Works with custom port', async (t: Assertions) => {
	stdMock.use({ print });
	const { app, server } = await N9NodeRouting({ http: { port: 4002 } });
	stdMock.restore();
	const output = stdMock.flush().stdout.filter((line) => !line.includes(':nest:'));
	t.true(output[0].includes('Listening on port 4002'), 'print launch port');
	// Close server
	await closeServer(server);
});

test('Works with preventListen = true', async (t: Assertions) => {
	stdMock.use({ print });
	const { app, server } = await N9NodeRouting({ http: { port: 4002, preventListen: true } });
	stdMock.restore();
	const output = stdMock.flush();

	t.is(output.stderr.length, 0);
	const err = await t.throwsAsync(() => rp('http://localhost:4200'));
	t.is(err.name, 'RequestError');
});

test('Works with custom log and should add a namespace', async (t: Assertions) => {
	const log = n9Log('custom');
	stdMock.use({ print });
	const { app, server } = await N9NodeRouting({ log });
	stdMock.restore();
	const output = stdMock.flush().stdout.filter((line) => !line.includes(':nest:'));
	t.true(output[0].includes('[custom:n9-node-routing] Listening on port 5000'));
	// Close server
	await closeServer(server);
});

test('Works without options', async (t: Assertions) => {
	stdMock.use({ print });
	const { app, server } = await N9NodeRouting();
	stdMock.restore();
	const output = stdMock.flush().stdout.filter((line) => !line.includes(':nest:'));
	t.true(output[0].includes('[n9-node-routing] Listening on port 5000'), '[n9-node-routing] Listening on port 5000');
	// Close server
	await closeServer(server);
});

test('Get app name on /', async (t: Assertions) => {
	stdMock.use({ print });
	const { server } = await N9NodeRouting({});
	// OK if no error thrown
	await t.notThrowsAsync(async () => await rp('http://localhost:5000/'));
	stdMock.restore();
	stdMock.flush();
	// Close server
	await closeServer(server);
});

test('Should not log the requests http.logLevel=false', async (t: Assertions) => {
	stdMock.use({ print });
	const { server } = await N9NodeRouting({
		http: { logLevel: false },
	});
	await rp('http://localhost:5000/');
	await rp('http://localhost:5000/ping');
	await rp('http://localhost:5000/routes');
	stdMock.restore();
	const output = stdMock.flush().stdout.filter((line) => !line.includes(':nest:'));

	t.is(output.length, 1);
	// Close server
	await closeServer(server);
});

test('Should log the requests with custom level', async (t: Assertions) => {
	stdMock.use({ print });
	const { server } = await N9NodeRouting({
		http: { logLevel: ':status :url' },
	});
	await rp('http://localhost:5000/');
	await rp('http://localhost:5000/ping');
	await rp('http://localhost:5000/routes');
	stdMock.restore();
	const output = stdMock.flush().stdout.filter((line) => !line.includes(':nest:'));
	t.is(output.length, 4, 'length');
	t.true(output[1].includes('200 /'), '200 /');
	t.true(output[2].includes('200 /ping'), 'ping');
	t.true(output[3].includes('200 /routes'), 'routes');
	// Close server
	await closeServer(server);
});

test('Fails with PORT without access', async (t: Assertions) => {
	stdMock.use({ print });
	const err = await t.throwsAsync(async () => {
		await N9NodeRouting({ http: { port: 80 } });
	});
	stdMock.restore();
	stdMock.flush();
	t.true(err.message.includes('Port 80 requires elevated privileges'));
});

test('Fails with PORT already used', async (t: Assertions) => {
	stdMock.use({ print });
	await N9NodeRouting({ http: { port: 6000 } });
	const err = await t.throwsAsync(async () => {
		await N9NodeRouting({ http: { port: 6000 } });
	});
	stdMock.restore();
	const output = stdMock.flush().stdout.filter((line) => !line.includes(':nest:'));
	t.true(output[0].includes('Listening on port 6000'));
	t.true(err.message.includes('Port 6000 is already in use'));
});

test('Fails with PORT not in common range', async (t: Assertions) => {
	stdMock.use({ print });
	const err = await t.throwsAsync(async () => {
		await N9NodeRouting({ http: { port: 10000000 } });
	});
	t.true(err.message.includes('ort should be'));
	stdMock.restore();
	stdMock.flush();
});
