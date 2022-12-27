import ava, { Assertions } from 'ava';
import got from 'got';
import { join } from 'path';
import * as stdMock from 'std-mocks';

// tslint:disable-next-line:import-name
import N9NodeRouting from '../src';
import commons, { closeServer, defaultNodeRoutingConfOptions } from './fixtures/commons';

const print = commons.print;

const appPath = join(__dirname, 'fixtures/micro-prometheus/');

ava.beforeEach(() => {
	delete (global as any).log;
});

ava('Basic usage, create http server', async (t: Assertions) => {
	stdMock.use({ print });
	(global as any).conf = {
		name: 'my-awesome-app',
	};
	const { server } = await N9NodeRouting({
		path: appPath,
		http: {
			port: 5000,
		},
		prometheus: {
			port: 5002,
		},
		enableLogFormatJSON: false,
		shutdown: {
			waitDurationBeforeStop: 5,
		},
		conf: defaultNodeRoutingConfOptions,
	});
	let res = await got('http://127.0.0.1:5000/sample-route');
	t.is(res.statusCode, 204);
	t.is(res.body, '');

	res = await got('http://127.0.0.1:5000/by-code/code1');
	t.is(res.statusCode, 204);
	t.is(res.body, '');

	// Check /foo route added on foo/foo.init.ts
	let resProm = await got('http://127.0.0.1:5002/', {
		responseType: 'text',
		resolveBodyOnly: true,
	});
	let resPromAsArray = resProm.split('\n');
	t.truthy(
		resPromAsArray.find(
			(line) =>
				line.includes('http_requests_total') &&
				line.includes('method="get"') &&
				line.includes('status_code="204"') &&
				line.includes('path="/sample-route"') &&
				line.includes('1'),
		),
		`Prom exposition contains call to sample-route`,
	);
	t.truthy(
		resPromAsArray.find(
			(line) =>
				line.includes('http_requests_total') &&
				line.includes('method="get"') &&
				line.includes('status_code="204"') &&
				line.includes('path="/by-code/:code"') &&
				line.includes('1'),
		),
		`Prom exposition contains call with route pattern`,
	);
	t.true(resProm.includes('version_info{version="'), `Prom exposition contains version info`);

	const cancelableRequest = got('http://127.0.0.1:5000/a-long-route/a-code', {
		method: 'POST',
	});

	resProm = await got('http://127.0.0.1:5002/', {
		responseType: 'text',
		resolveBodyOnly: true,
	});
	resPromAsArray = resProm.split('\n');

	const prometheusMetricsForOnGoingRequests = resPromAsArray.filter((line) =>
		line.includes('http_request_in_flight'),
	);
	t.is(prometheusMetricsForOnGoingRequests.length, 4, '4 lines, 2 titles, 2 for requests');
	t.is(
		prometheusMetricsForOnGoingRequests[0],
		'# HELP http_request_in_flight_total A gauge of requests currently being served by the app',
	);
	t.is(prometheusMetricsForOnGoingRequests[1], '# TYPE http_request_in_flight_total gauge');
	t.is(prometheusMetricsForOnGoingRequests[2], 'http_request_in_flight_total{method="GET"} 0');
	t.is(prometheusMetricsForOnGoingRequests[3], 'http_request_in_flight_total{method="POST"} 1');

	await cancelableRequest;

	// Check logs
	stdMock.restore();

	// Close server
	await closeServer(server);
});
