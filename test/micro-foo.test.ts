import { N9Error } from '@neo9/n9-node-utils';
import ava, { Assertions } from 'ava';
import { join } from 'path';
import * as stdMock from 'std-mocks';
import * as tmp from 'tmp-promise';

// tslint:disable-next-line:import-name
import N9NodeRouting from '../src';
import commons, { closeServer, defaultConfOptions } from './fixtures/commons';
import { getLogsFromFile, parseJSONLogAndRemoveTime } from './fixtures/helper';

const print = commons.print;

const microFoo = join(__dirname, 'fixtures/micro-foo/');

ava.beforeEach(() => {
	delete (global as any).log;
});

ava('Basic usage, create http server', async (t: Assertions) => {
	const oldNodeEnv = process.env.NODE_ENV;
	process.env.NODE_ENV = 'development';
	const file = await tmp.file();
	const { server } = await N9NodeRouting({
		path: microFoo,
		logOptions: { developmentOutputFilePath: file.path },
		conf: defaultConfOptions,
	});
	// Check /foo route added on foo/foo.init.ts
	let res: any = await commons.jsonHttpClient.get<{ foo: string }>('http://localhost:5000/foo');
	t.is(res.foo, 'bar');

	// Check / route
	res = await commons.jsonHttpClient.get<string>(
		'http://localhost:5000/',
		{},
		{},
		{ responseType: 'text' },
	);
	t.is(res, 'n9-node-routing');

	// Check /ping route
	res = await commons.jsonHttpClient.get<string>(
		'http://localhost:5000/ping',
		{},
		{},
		{ responseType: 'text' },
	);
	t.is(res, 'pong');

	// Check /version route
	res = await commons.jsonHttpClient.get<string>(
		'http://localhost:5000/version',
		{},
		{},
		{ responseType: 'text' },
	);
	const matchVersion = (res as string).match(/^[0-9]+\.[0-9]+\.[0-9]+.*$/);
	t.is(matchVersion.length, 1);

	// Check /404 route
	res = await t.throwsAsync<N9Error>(
		async () => await commons.jsonHttpClient.get('http://localhost:5000/404'),
	);
	t.is(res.status, 404, '404');
	t.is(res.message, 'not-found', 'not-found');
	t.is(res.context?.srcError?.context?.url, '/404', '/404');

	// Check logs
	const output = await getLogsFromFile(file.path);

	// Logs on stdout
	t.true(output[0].includes('Conf loaded: development'), 'Conf loaded: development');
	t.true(
		output[1].includes('Configuration validation is disabled'),
		'Configuration validation is disabled',
	);
	t.true(output[2].includes('Init module bar'), 'Init module bar');
	t.true(output[3].includes('Init module foo'), 'Init module foo');
	t.true(output[4].includes('Hello foo.init'), 'Hello foo.init');
	t.true(output[5].includes('Listening on port 5000'), 'Listening on port 5000');
	t.true(output[7].includes('GET /foo'), 'GET /foo');
	t.true(output[8].includes('GET /'), 'GET /');
	t.true(output[9].includes('GET /ping'), 'GET /ping');
	t.true(output[10].includes('GET /version'), 'GET /version');
	t.true(output[11].includes('not-found'), `not-found ${output[8]}`);
	t.true(output[12].includes('  err: {'), `Error details on multi-lines ${output[9]}`);
	t.true(output[13].includes('"type": "N9Error",'), `Error details on multi-lines ${output[10]}`);
	t.true(
		output[14].includes('"message": "not-found",'),
		`Error details on multi-lines ${output[11]}`,
	);
	t.true(output[15].includes('"stack":'), `Error details on multi-lines ${output[12]}`);
	t.true(output[16].includes('Error: not-found'), `Error details on multi-lines ${output[13]}`);

	t.true(output[output.length - 1].includes('GET /404'), `GET /404 ${output[output.length - 1]}`);

	// Close server
	await closeServer(server);
	process.env.NODE_ENV = oldNodeEnv;
});

ava('Basic usage, create http server on production', async (t: Assertions) => {
	stdMock.use({ print });
	process.env.NODE_ENV = 'production';
	const { server } = await N9NodeRouting({
		path: microFoo,
		conf: defaultConfOptions,
	});
	// Check /foo route added on foo/foo.init.ts
	let res: any = await commons.jsonHttpClient.get('http://localhost:5000/foo');
	t.is(res.foo, 'bar');

	// Check / route
	res = await commons.jsonHttpClient.get<string>(
		'http://localhost:5000/',
		{},
		{},
		{ responseType: 'text' },
	);
	t.is(res, 'n9-node-routing');

	// Check /ping route
	res = await commons.jsonHttpClient.get<string>(
		'http://localhost:5000/ping',
		{},
		{},
		{ responseType: 'text' },
	);
	t.is(res, 'pong');

	// Check /404 route
	res = await t.throwsAsync<N9Error>(
		async () => await commons.jsonHttpClient.get('http://localhost:5000/404'),
	);
	t.is(res.status, 404);
	t.is(res.message, 'not-found');
	t.is(res.context?.srcError?.context?.url, '/404');

	// Check logs
	stdMock.restore();
	const output = stdMock.flush().stdout.filter(commons.excludeSomeLogs);

	// Logs on stdout
	t.deepEqual(
		parseJSONLogAndRemoveTime(output[2]),
		{ level: 'info', message: 'Init module bar', label: 'n9-node-routing' },
		`Init module bar`,
	);
	t.deepEqual(
		parseJSONLogAndRemoveTime(output[3]),
		{ level: 'info', message: 'Init module foo', label: 'n9-node-routing' },
		`Init module foo`,
	);
	t.deepEqual(
		parseJSONLogAndRemoveTime(output[4]),
		{ level: 'info', message: 'Hello foo.init', label: 'n9-node-routing' },
		`Hello foo.init`,
	);
	t.deepEqual(
		parseJSONLogAndRemoveTime(output[5]),
		{ level: 'info', message: 'Listening on port 5000', label: 'n9-node-routing' },
		'Listening on port 5000',
	);
	t.true(output[7].includes(',"path":"/foo","status":"200","durationMs":'), 'path" /foo');
	t.true(output[8].includes(',"path":"/","status":"200","durationMs":'), 'path /');
	t.true(output[9].includes(',"path":"/ping","status":"200","durationMs":'), 'path /ping');
	t.true(output[10].includes('"status":404,"context":{"url":"/404"},"hostname":'), 'status 404');
	t.true(output[10].includes('"stack":"Error: not-found'), 'Error: not-found');
	t.true(output[11].includes(',"path":"/404","status":"404","durationMs":'), 'path /404');

	// Close server
	await closeServer(server);
	delete process.env.NODE_ENV;
});

ava('Check /routes', async (t) => {
	stdMock.use({ print });
	const { server } = await N9NodeRouting({
		path: microFoo,
		http: { port: 5575 },
		conf: defaultConfOptions,
	});

	// Check acl on routes
	const res = await commons.jsonHttpClient.get<any[]>('http://localhost:5575/routes');
	t.is(res.length, 1);

	const route1 = res[0];
	t.is(route1.description, undefined);
	t.is(route1.method, 'get');
	t.is(route1.path, '/foo');
	t.is(route1.acl.perms[0].action, 'readFoo');

	// Check logs
	stdMock.restore();
	stdMock.flush();
	// Close server
	await closeServer(server);
});

ava('Call routes (versionning)', async (t: Assertions) => {
	stdMock.use({ print: commons.print });
	const { server } = await N9NodeRouting({
		path: microFoo,
		http: { port: 5559 },
		conf: defaultConfOptions,
	});
	let res = await commons.jsonHttpClient.post<any>('http://localhost:5559/v1/bar');
	t.is(res.bar, 'foo');

	// Call /v1/fou
	res = await commons.jsonHttpClient.post('http://localhost:5559/v1/fou', { hi: 'hello' });
	t.deepEqual(res, { hi: 'hello' });

	// Call special route which fails
	let err = await t.throwsAsync<N9Error>(async () =>
		commons.jsonHttpClient.post('http://localhost:5559/v1/bar', {}, { error: true }),
	);
	t.is(err.status, 500);
	t.is(err.message, 'bar-error');
	t.is(err.context.srcError.stack, undefined, `Stack stay inside api`);

	// Call special route which fails with extendable error
	err = await t.throwsAsync(async () =>
		commons.jsonHttpClient.post('http://localhost:5559/v2/bar', {}, { error: true }),
	);
	t.is(err.status, 505);
	t.is(err.message, 'bar-extendable-error');
	t.deepEqual(err.context.srcError.context, {
		test: true,
		error: { message: 'sample-error', name: 'Error' },
	});
	t.is(err.context.srcError.stack, undefined, `Stack stay inside api`);
	stdMock.restore();
	const output = stdMock.flush();
	t.true(output.stderr.join(' ').includes('bar-extendable-error'), 'bar-extendable-error');
	// Close server
	await closeServer(server);
});

ava('Call routes with error in development (error key)', async (t: Assertions) => {
	stdMock.use({ print });
	const { server } = await N9NodeRouting({
		path: microFoo,
		http: { port: 5587 },
		conf: defaultConfOptions,
	});
	// Call error with no message
	const err = await t.throwsAsync<N9Error>(async () =>
		commons.jsonHttpClient.get('http://localhost:5587/bar-fail'),
	);
	t.is(err.status, 500);
	t.deepEqual(
		err.context.srcError,
		{
			code: 'unspecified-error',
			status: 500,
			context: {},
		},
		'response body should be a n9 error',
	);
	stdMock.restore();
	stdMock.flush();
	// Close server
	await closeServer(server);
});

ava('Call routes with error in production (no leak)', async (t: Assertions) => {
	process.env.NODE_ENV = 'production';
	stdMock.use({ print });
	const { server } = await N9NodeRouting({
		path: microFoo,
		http: { port: 5587 },
		conf: defaultConfOptions,
	});

	// Call special route which fails
	let err = await t.throwsAsync<N9Error>(async () =>
		commons.jsonHttpClient.post('http://localhost:5587/v1/bar', {}, { error: true }),
	);
	t.is(err.status, 500);
	t.deepEqual(
		err.context.srcError,
		{
			code: 'bar-error',
			status: 500,
			context: {},
			// no error key
		},
		'bar-error',
	);

	// Call special route which fails with extendable error
	err = await t.throwsAsync(async () =>
		commons.jsonHttpClient.post('http://localhost:5587/v2/bar', {}, { error: true }),
	);
	t.is(err.status, 505);
	t.deepEqual(
		err.context.srcError,
		{
			code: 'bar-extendable-error',
			status: 505,
			context: {
				test: true,
				error: {
					message: 'sample-error',
					name: 'Error',
				},
			},
			// no error key
		},
		'bar-extendable-error',
	);

	// Call 404
	err = await t.throwsAsync(async () => commons.jsonHttpClient.get('http://localhost:5587/404'));
	t.is(err.status, 404);
	t.deepEqual(
		err.context.srcError,
		{
			code: 'not-found',
			status: 404,
			context: {
				url: '/404',
			},
			// no error key
		},
		'not-found',
	);

	// Call error with no message
	err = await t.throwsAsync(async () =>
		commons.jsonHttpClient.get('http://localhost:5587/bar-fail'),
	);
	t.is(err.status, 500);
	t.deepEqual(
		err.context.srcError,
		{
			code: 'unspecified-error',
			status: 500,
			context: {},
			// no error key
		},
		'unspecified-error',
	);
	stdMock.restore();
	const output = stdMock.flush();
	t.true(output.stderr.join(' ').includes('bar-extendable-error'), 'bar-extendable-error');
	// Close server
	await closeServer(server);
	delete process.env.NODE_ENV;
});
