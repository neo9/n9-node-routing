import test, { Assertions } from 'ava';
import { join } from 'path';
import * as stdMock from 'std-mocks';
import N9NodeRouting from '../src';
import commons, { closeServer } from './fixtures/commons';
import got from 'got';

const print = commons.print;

const MICRO_FOO = join(__dirname, 'fixtures/micro-prometheus/');

test.beforeEach(() => {
	delete global.log;
});

test('Basic usage, create http server', async (t: Assertions) => {
	stdMock.use({ print });
	global.conf = {
		name: 'my-awesome-app',
	};
	const { server } = await N9NodeRouting({
		path: MICRO_FOO,
		http: {
			port: 5000,
		},
		prometheus: {
			port: 5001,
		},
	});
	let res = await got('http://localhost:5000/sample-route');
	t.is(res.statusCode, 204);
	t.is(res.body, '');

	res = await got('http://localhost:5000/by-code/code1');
	t.is(res.statusCode, 204);
	t.is(res.body, '');

	// Check /foo route added on foo/foo.init.ts
	const resProm = await got('http://localhost:5001/', {
		responseType: 'text',
		resolveBodyOnly: true,
	});
	t.true(
		resProm.includes('http_requests_total{method="get",status_code="204",path="/sample-route"} 1'),
		'Prom exposition contains call to sample-route',
	);
	t.true(
		resProm.includes('http_requests_total{method="get",status_code="204",path="/by-code/:code"} 1'),
		'Prom exposition contains call with route pattern',
	);
	t.true(resProm.includes('version_info{version="'), 'Prom exposition contains version info');

	// Check logs
	stdMock.restore();

	// Close server
	await closeServer(server);
});
