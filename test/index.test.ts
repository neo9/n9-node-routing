import n9NodeLog from '@neo9/n9-node-log';
import ava, { Assertions } from 'ava';
import got from 'got';
import * as stdMock from 'std-mocks';
import * as tmp from 'tmp-promise';

// tslint:disable-next-line:import-name
import N9NodeRouting from '../src';
import commons, {
	closeServer,
	defaultNodeRoutingConfOptions,
	nodeRoutingMinimalOptions,
} from './fixtures/commons';
import { getLogsFromFile } from './fixtures/helper';

const print = commons.print;

ava.beforeEach(() => {
	delete (global as any).log;
});

ava('Works with custom port', async (t: Assertions) => {
	stdMock.use({ print });
	const { server } = await N9NodeRouting({
		http: { port: 4002 },
		conf: defaultNodeRoutingConfOptions,
	});
	stdMock.restore();
	const output = stdMock.flush().stdout.filter(commons.excludeSomeLogs);
	t.true(output[4].includes('Listening on port 4002'), 'print launch port');
	// Close server
	await closeServer(server);
});

ava('Works with preventListen = true', async (t: Assertions) => {
	stdMock.use({ print });
	await N9NodeRouting({
		http: { port: 4002, preventListen: true },
		conf: defaultNodeRoutingConfOptions,
	});
	stdMock.restore();
	const output = stdMock.flush();

	t.is(output.stderr.length, 0);
	const err = await t.throwsAsync(async () => got('http://localhost:4200'));
	t.is(err.name, 'RequestError');
});

ava('Should keep the custom logger and listening on port 5000', async (t: Assertions) => {
	const oldNodeEnv = process.env.NODE_ENV;
	process.env.NODE_ENV = 'development';
	const file = await tmp.file();

	stdMock.use({ print });
	const log = n9NodeLog('custom', { developmentOutputFilePath: file.path });
	const { server } = await N9NodeRouting({ log, conf: defaultNodeRoutingConfOptions });
	stdMock.restore();

	const output = stdMock.flush();
	t.true(output.stdout[4].includes('Listening on port 5000'));
	t.true(output.stdout[4].includes('"label":"custom"'));

	// Close server
	await closeServer(server);
	process.env.NODE_ENV = oldNodeEnv;
});

ava('Works without options (except conf for tests)', async (t: Assertions) => {
	const file = await tmp.file();
	const oldNodeEnv = process.env.NODE_ENV;
	process.env.NODE_ENV = 'development';
	const { server } = await N9NodeRouting({
		logOptions: { developmentOutputFilePath: file.path },
		conf: defaultNodeRoutingConfOptions,
	});
	const output = await getLogsFromFile(file.path);
	t.true(
		output[4].includes('[n9-node-routing] Listening on port 5000'),
		`[n9-node-routing] Listening on port 5000 output : ${JSON.stringify(output)}`,
	);

	// Close server
	await closeServer(server);
	process.env.NODE_ENV = oldNodeEnv;
});

ava('Works without options in production (except conf for test purpose)', async (t: Assertions) => {
	stdMock.use({ print });
	const oldNodeEnv = process.env.NODE_ENV;
	process.env.NODE_ENV = 'production';
	const { server } = await N9NodeRouting({ conf: defaultNodeRoutingConfOptions });
	stdMock.restore();
	const output = stdMock.flush().stdout.filter(commons.excludeSomeLogs);
	const line2 = JSON.parse(output[4]);
	delete line2.timestamp;

	t.deepEqual(line2, {
		label: 'n9-node-routing',
		level: 'info',
		message: 'Listening on port 5000',
	});

	// Close server
	await closeServer(server);
	process.env.NODE_ENV = oldNodeEnv;
});

ava('Get app name on /', async (t: Assertions) => {
	stdMock.use({ print });
	const { server } = await N9NodeRouting(nodeRoutingMinimalOptions);
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
		conf: defaultNodeRoutingConfOptions,
	});
	await got('http://localhost:5000/');
	await got('http://localhost:5000/ping');
	await got('http://localhost:5000/routes');
	stdMock.restore();
	const output = stdMock.flush().stdout.filter(commons.excludeSomeLogs);
	t.is(output.length, 6);
	// Close server
	await closeServer(server);
});

ava('Should log the requests with custom level', async (t: Assertions) => {
	stdMock.use({ print });
	const { server } = await N9NodeRouting({
		http: { logLevel: ':status :url' },
		conf: defaultNodeRoutingConfOptions,
	});
	await got('http://localhost:5000/');
	await got('http://localhost:5000/ping');
	await got('http://localhost:5000/routes');
	stdMock.restore();
	const output = stdMock.flush().stdout.filter(commons.excludeSomeLogs);
	t.is(output.length, 9, 'length');
	t.true(output[6].includes('200 /'), '200 /');
	t.true(output[7].includes('200 /ping'), 'ping');
	t.true(output[8].includes('200 /routes'), 'routes');
	// Close server
	await closeServer(server);
});

ava('Fails with PORT without access', async (t: Assertions) => {
	stdMock.use({ print });
	const err = await t.throwsAsync(async () => {
		await N9NodeRouting({ http: { port: 80 }, conf: defaultNodeRoutingConfOptions });
	});
	stdMock.restore();
	stdMock.flush();
	t.true(err.message.includes('Port 80 requires elevated privileges'));
});

ava('Fails with PORT already used', async (t: Assertions) => {
	stdMock.use({ print });
	await N9NodeRouting({ http: { port: 6000 }, conf: defaultNodeRoutingConfOptions });
	const err = await t.throwsAsync(async () => {
		await N9NodeRouting({ http: { port: 6000 }, conf: defaultNodeRoutingConfOptions });
	});
	stdMock.restore();
	const output = stdMock.flush().stdout.filter(commons.excludeSomeLogs);
	t.true(output[4].includes('Listening on port 6000'));
	t.true(err.message.includes('Port 6000 is already in use'));
});

ava('Fails with PORT not in common range', async (t: Assertions) => {
	stdMock.use({ print });

	const err = await t.throwsAsync(async () => {
		await N9NodeRouting({ http: { port: 10000000 }, conf: defaultNodeRoutingConfOptions });
	});
	t.true(err.message.includes('ort should be'));
	stdMock.restore();
	stdMock.flush();
});

ava('Should work without options using default loading conf options', async (t: Assertions) => {
	// throw an error because there is no conf in n9NodeRouting
	const error = await t.throwsAsync(N9NodeRouting());

	t.true(!!error);
	t.true(error.message.includes('Could not load config file'));
	t.true(error.message.includes('conf/application'));
});

ava('Can define body-parser limit', async (t: Assertions) => {
	stdMock.use({ print });
	const { server } = await N9NodeRouting({
		http: {
			bodyParser: {
				limit: 5,
			},
		},
		conf: defaultNodeRoutingConfOptions,
	});
	stdMock.restore();

	await t.throwsAsync(
		async () =>
			await commons.jsonHttpClient.post<any>('http://localhost:5000/ping', {
				key: 'A body bigger thant 5 bytes',
			}),
		{
			message: 'PayloadTooLargeError',
		},
	);
	// Close server
	await closeServer(server);
});
