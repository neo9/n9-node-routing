import test, { ExecutionContext } from 'ava';
import got from 'got';

import { isPortAvailable } from '../src/utils';
import { end, init, mockAndCatchStd, TestContext } from './fixtures';

const { runBeforeTest } = init('micro-prometheus', {
	avoidBeforeEachHook: true,
});

test('Basic usage, create http server', async (t: ExecutionContext<TestContext>) => {
	await runBeforeTest(t, {
		n9NodeRoutingOptions: {
			prometheus: {
				port: 5002,
			},
		},
	});

	t.false(await isPortAvailable(5002), 'Prometheus server port is used');

	await mockAndCatchStd(async () => {
		await t.notThrowsAsync(t.context.httpClient.get<void>('http://127.0.0.1:5000/sample-route'));
		await t.notThrowsAsync(t.context.httpClient.get<void>('http://127.0.0.1:5000/by-code/code1'));
	});

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

	const { result } = await mockAndCatchStd(() => {
		return { promise: t.context.httpClient.post('http://127.0.0.1:5000/a-long-route/a-code') };
	});

	resProm = await got('http://127.0.0.1:5002/', {
		responseType: 'text',
		resolveBodyOnly: true,
	});
	resPromAsArray = resProm.split('\n');

	const prometheusMetricsForVersionInfo = resPromAsArray.filter(
		(line) => line.includes(' version_info ') || line.includes('n9-node-routing'),
	);
	t.is(prometheusMetricsForVersionInfo.length, 3, '3 lines, 2 titles, 1 for data');
	t.is(prometheusMetricsForVersionInfo[0], '# HELP version_info App version');
	t.is(prometheusMetricsForVersionInfo[1], '# TYPE version_info gauge');
	t.true(prometheusMetricsForVersionInfo[2].startsWith('version_info{version="'), 'check data');
	t.true(
		prometheusMetricsForVersionInfo[2].endsWith(',name="n9-node-routing"} 1'),
		'check data end',
	);

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

	await result.promise;
});

test('Disable prometheus', async (t: ExecutionContext<TestContext>) => {
	await runBeforeTest(t, {
		n9NodeRoutingOptions: {
			prometheus: {
				port: 5002,
				isEnabled: false,
			},
		},
	});
	t.true(await isPortAvailable(5002), 'should not create prometheus server / use its port');

	const res = await got('http://127.0.0.1:5000/sample-route');
	t.is(res.statusCode, 204);
	t.is(res.body, '');

	await t.throwsAsync(
		t.context.httpClient.get('http://127.0.0.1:5002/'),
		{
			message: 'ECONNREFUSED',
		},
		'Prometheus server should not be started',
	);
});

test('Try to run prometheus server twice on same port', async (t: ExecutionContext<TestContext>) => {
	await runBeforeTest(t, {});
	const n9NodeRoutingStartResult = t.context.n9NodeRoutingStartResult;

	await t.throwsAsync(
		runBeforeTest(t, {
			n9NodeRoutingOptions: {
				http: {
					port: 5002,
				},
			},
		}),
		{
			message: 'prometheus-server-port-unavailable',
		},
	);

	await end(n9NodeRoutingStartResult.server, n9NodeRoutingStartResult.prometheusServer);
});
