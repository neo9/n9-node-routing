import test, { ExecutionContext } from 'ava';
import { NextFunction, Request, Response } from 'express';

import { init, TestContext, urlPrefix } from './fixtures';

const { runBeforeTest } = init('micro-foo', {
	avoidBeforeEachHook: true,
	n9NodeRoutingOptions: {
		hasProxy: true, // tell N9NodeRouting to parse `session` header
	},
});

test('Check if the hooks are called', async (t: ExecutionContext<TestContext>) => {
	await runBeforeTest(t, {
		n9NodeRoutingOptions: {
			http: {
				beforeRoutingControllerLaunchHook: ({ log }) => {
					log.info('beforeRoutingControllerLaunchHook');
				},
				afterRoutingControllerLaunchHook: ({ log }) => {
					log.info('afterRoutingControllerLaunchHook');
				},
			},
		},
	});

	t.is(t.context.stdout.length, 14);
	t.true(
		t.context.stdout[7].includes('[n9-node-routing:before-hook] beforeRoutingControllerLaunchHook'),
	);
	t.true(
		t.context.stdout[8].includes('[n9-node-routing:after-hook] afterRoutingControllerLaunchHook'),
	);

	const rep = await t.context.httpClient.get<{ response: string }>([urlPrefix, 'ping']);
	t.deepEqual(rep, { response: 'pong' });
});

test('Add custom route in beforeRoutingControllerLaunchHook (imagine a proxy)', async (t: ExecutionContext<TestContext>) => {
	await runBeforeTest(t, {
		n9NodeRoutingOptions: {
			http: {
				beforeRoutingControllerLaunchHook: ({ expressApp, log }) => {
					expressApp.use('/custom-endpoint', (req: Request, res: Response, next: NextFunction) => {
						log.info(`A message in the endpoint`);
						res.json({ response: 1, queryParams: req.query });
						next();
					});
				},
			},
		},
	});

	const rep = await t.context.httpClient.get<any>([urlPrefix, 'custom-endpoint?test=a&test=b']);
	t.deepEqual(
		rep,
		{ response: 1, queryParams: { test: ['a', 'b'] } },
		'Endpoint should respond some data with queryParams',
	);
});
