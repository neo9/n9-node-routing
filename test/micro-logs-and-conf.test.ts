import { N9ConfMergeStrategy } from '@neo9/n9-node-conf';
import test, { ExecutionContext } from 'ava';
import got from 'got';
import { Container } from 'typedi';

import { N9NodeRoutingBaseConf } from '../src/models/routing';
import {
	defaultNodeRoutingConfOptions,
	init,
	mockAndCatchStd,
	TestContext,
	urlPrefix,
} from './fixtures';

export interface AConfType extends N9NodeRoutingBaseConf {
	someConfAttr: string;
}

const { runBeforeTest } = init<AConfType>('micro-logs', {
	avoidBeforeEachHook: true,
});

test('Basic usage, check logs', async (t: ExecutionContext<TestContext>) => {
	await runBeforeTest(t, {
		nodeEnvValue: 'production',
		n9NodeRoutingOptions: {
			enableLogFormatJSON: false,
			conf: {
				n9NodeConf: {
					...defaultNodeRoutingConfOptions.n9NodeConf,
					override: {
						mergeStrategy: N9ConfMergeStrategy.V2,
						value: {
							someConfAttr: 'value',
						},
					},
				},
			},
		},
	});

	t.is(t.context.stdLength, 13, 'output length');
	t.true(
		t.context.stdout[0].includes(
			'It is recommended to use JSON format outside development environment',
		),
		'Warn n9--node-log',
	);
	t.true(t.context.stdout[5].includes('Init module bar'), 'Init module bar');
	t.true(t.context.stdout[6].includes('Hello bar.init'), 'Hello bar.init');
	t.true(t.context.stdout[7].includes('Listening on port 5000'), 'Listening on port 5000');
	t.true(t.context.stdout[8].includes('startup'), 'Startup');
	t.true(t.context.stdout[10].includes('durationMs'), 'Duration Ms of statup');

	const { stdout, result } = await mockAndCatchStd(async () => {
		// Check /foo route added on foo/foo.init.ts
		return await t.context.httpClient.get([urlPrefix, 'bar']);
	});

	t.true(stdout[0].includes('message in controller'), 'message in controller');
	t.true(stdout[0].includes('] ('), 'contains request id');
	t.true(stdout[0].includes(')'), 'contains request id 2');
	t.truthy(
		stdout[0].match(
			/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z - info : \[n9-node-routing\] \([a-zA-Z0-9-_]{10}\) message in controller$/g,
		),
		'check line match message in controller',
	); // ex: 2023-10-09T13:15:28.058Z - info : [n9-node-routing] (dLigrN1Rq) message in controller
	t.true(stdout[1].includes('] ('));
	const match = stdout[1].match(/\([a-zA-Z0-9_-]{7,14}\)/g);
	t.truthy(match, 'should match one');
	const matchLength = match.length;
	t.true(matchLength === 1);
	t.true(stdout[1].includes('GET /bar'));
	t.deepEqual(result, Container.get('conf'), 'body response is conf');
});

test('Basic usage, check logs with empty response', async (t: ExecutionContext<TestContext>) => {
	await runBeforeTest(t, {
		nodeEnvValue: 'development',
		n9NodeRoutingOptions: {
			conf: {
				n9NodeConf: {
					...defaultNodeRoutingConfOptions.n9NodeConf,
					override: {
						mergeStrategy: N9ConfMergeStrategy.V2,
						value: {
							someConfAttr: 'value',
						},
					},
				},
			},
		},
	});
	t.is(t.context.stdLength, 12, 'check nb logs');
	t.true(t.context.stdout[4].includes('Init module bar'), 'Init module bar');
	t.true(t.context.stdout[5].includes('Hello bar.init'), 'Hello bar.init');
	t.true(t.context.stdout[6].includes('End init module bar'), 'End init module bar');
	t.true(t.context.stdout[7].includes('Listening on port 5000'), 'Listening on port 5000');

	const { stdout } = await mockAndCatchStd(async () => {
		const res = await got(`${urlPrefix}/empty`);
		t.is(res.statusCode, 204, 'resp 204 status');
	});

	t.true(stdout[0].includes('] ('));
	t.truthy(stdout[0].match(/\([a-zA-Z0-9_-]{7,14}\)/g));
	t.true(stdout[0].includes('GET /empty'), 'GET /empty');
});

test('JSON output', async (t: ExecutionContext<TestContext>) => {
	await runBeforeTest(t, {
		nodeEnvValue: 'development',
		n9NodeRoutingOptions: {
			enableLogFormatJSON: true,
			conf: {
				n9NodeConf: {
					...defaultNodeRoutingConfOptions.n9NodeConf,
					override: {
						mergeStrategy: N9ConfMergeStrategy.V2,
						value: {
							someConfAttr: 'value',
						},
					},
				},
			},
		},
	});

	const { stdout } = await mockAndCatchStd(async () => {
		const res = await got(`${urlPrefix}/bar`);
		t.is(res.statusCode, 200);
	});

	const lineChecked = stdout[1];
	t.truthy(lineChecked);
	t.truthy(lineChecked.match(/"method":"GET"/g), 'GET /bar 1');
	t.truthy(lineChecked.match(/"path":"\/bar"/g), 'GET /bar 2');
	t.truthy(
		lineChecked.match(/"durationMs":[0-9]{1,5}\.[0-9]{1,5}/g),
		`Has response time ms : ${lineChecked}`,
	);
	t.truthy(
		lineChecked.match(/"totalDurationMs":[0-9]{1,5}\.[0-9]{1,5}/g),
		'Has total response time ms',
	);
});
