import n9NodeLog from '@neo9/n9-node-log';
import ava, { Assertions } from 'ava';
import got from 'got';
import * as stdMock from 'std-mocks';
// tslint:disable-next-line:import-name
import N9NodeRouting from '../src';
import commons, { closeServer } from './fixtures/commons';

const print = commons.print;

ava.beforeEach(() => {
	delete (global as any).log;
});

ava('Works with custom port', async (t: Assertions) => {
	stdMock.use({ print });
	const { server } = await N9NodeRouting({ http: { port: 4002 } });
	stdMock.restore();
	const output = stdMock.flush().stdout.filter(commons.excludeSomeLogs);
	t.true(output[0].includes('Listening on port 4002'), 'print launch port');
	// Close server
	await closeServer(server);
});

ava('Works with preventListen = true', async (t: Assertions) => {
	stdMock.use({ print });
	await N9NodeRouting({ http: { port: 4002, preventListen: true } });
	stdMock.restore();
	const output = stdMock.flush();

	t.is(output.stderr.length, 0);
	const err = await t.throwsAsync(async () => got('http://localhost:4200'));
	t.is(err.name, 'RequestError');
});

ava('Works with custom log and should add a namespace', async (t: Assertions) => {
	const oldNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'development';
	const log = n9NodeLog('custom');
	stdMock.use({ print });
	const { server } = await N9NodeRouting({ log });
	stdMock.restore();
	const output = stdMock.flush().stdout.filter(commons.excludeSomeLogs);
	t.true(output[0].includes('[custom:n9-node-routing] Listening on port 5000'), `output : ${JSON.stringify(output)}`);
	// Close server
	await closeServer(server);
  process.env.NODE_ENV = oldNodeEnv;
});

ava('Works without options', async (t: Assertions) => {
	stdMock.use({ print });
	const oldNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'development';
	const { server } = await N9NodeRouting();
	stdMock.restore();
	const output = stdMock.flush().stdout.filter(commons.excludeSomeLogs);
	t.true(
		output[0].includes('[n9-node-routing] Listening on port 5000'),
		`[n9-node-routing] Listening on port 5000 output : ${JSON.stringify(output)}`,
	);

	// Close server
	await closeServer(server);
  process.env.NODE_ENV = oldNodeEnv;
});

ava('Get app name on /', async (t: Assertions) => {
	stdMock.use({ print });
	const { server } = await N9NodeRouting({});
	// OK if no error thrown
	await t.notThrowsAsync(async () => await got('http://localhost:5000/'));
	stdMock.restore();
	stdMock.flush();
	// Close server
	await closeServer(server);
});

ava('Should not log the requests http.logLevel=false', async (t: Assertions) => {
	stdMock.use({ print });
	const { server } = await N9NodeRouting({
		http: { logLevel: false },
	});
	await got('http://localhost:5000/');
	await got('http://localhost:5000/ping');
	await got('http://localhost:5000/routes');
	stdMock.restore();
	const output = stdMock.flush().stdout.filter(commons.excludeSomeLogs);
	t.is(output.length, 1);
	// Close server
	await closeServer(server);
});

ava('Should log the requests with custom level', async (t: Assertions) => {
	stdMock.use({ print });
	const { server } = await N9NodeRouting({
		http: { logLevel: ':status :url' },
	});
	await got('http://localhost:5000/');
	await got('http://localhost:5000/ping');
	await got('http://localhost:5000/routes');
	stdMock.restore();
	const output = stdMock.flush().stdout.filter(commons.excludeSomeLogs);
	t.is(output.length, 4, 'length');
	t.true(output[1].includes('200 /'), '200 /');
	t.true(output[2].includes('200 /ping'), 'ping');
	t.true(output[3].includes('200 /routes'), 'routes');
	// Close server
	await closeServer(server);
});

ava('Fails with PORT without access', async (t: Assertions) => {
	stdMock.use({ print });
	const err = await t.throwsAsync(async () => {
		await N9NodeRouting({ http: { port: 80 } });
	});
	stdMock.restore();
	stdMock.flush();
	t.true(err.message.includes('Port 80 requires elevated privileges'));
});

ava('Fails with PORT already used', async (t: Assertions) => {
	stdMock.use({ print });
	await N9NodeRouting({ http: { port: 6000 } });
	const err = await t.throwsAsync(async () => {
		await N9NodeRouting({ http: { port: 6000 } });
	});
	stdMock.restore();
	const output = stdMock.flush().stdout.filter(commons.excludeSomeLogs);
	t.true(output[0].includes('Listening on port 6000'));
	t.true(err.message.includes('Port 6000 is already in use'));
});

ava('Fails with PORT not in common range', async (t: Assertions) => {
	stdMock.use({ print });
	const err = await t.throwsAsync(async () => {
		await N9NodeRouting({ http: { port: 10000000 } });
	});
	t.true(err.message.includes('ort should be'));
	stdMock.restore();
	stdMock.flush();
});
