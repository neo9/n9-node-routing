import { N9Log } from '@neo9/n9-node-log';
import ava, { Assertions } from 'ava';
import { NextFunction, Request, Response } from 'express';
import * as stdMock from 'std-mocks';

// tslint:disable-next-line:import-name
import N9NodeRouting, { N9HttpClient } from '../src';
import commons, { closeServer, defaultNodeRoutingConfOptions } from './fixtures/commons';

ava('Check if the hooks are called', async (t: Assertions) => {
	stdMock.use({ print: commons.print });
	const { server } = await N9NodeRouting({
		hasProxy: true, // tell N9NodeRouting to parse `session` header
		http: {
			port: 6001,
			beforeRoutingControllerLaunchHook: ({ log }) => {
				log.info('beforeRoutingControllerLaunchHook');
			},
			afterRoutingControllerLaunchHook: ({ log }) => {
				log.info('afterRoutingControllerLaunchHook');
			},
		},
		conf: defaultNodeRoutingConfOptions,
	});
	const output = stdMock.flush().stdout.filter(commons.excludeSomeLogs);

	t.is(output.length, 8);
	t.true(output[4].includes('before-hook'));
	t.true(output[4].includes('beforeRoutingControllerLaunchHook'));
	t.true(output[5].includes('after-hook'));
	t.true(output[5].includes('afterRoutingControllerLaunchHook'));

	/*
	 ** Test ping route
	 */
	const rep = await commons.jsonHttpClient.get<{ response: string }>('http://localhost:6001/ping');
	t.deepEqual(rep, { response: 'pong' });

	// Clear stdout
	stdMock.restore();
	stdMock.flush();
	// Close server
	await closeServer(server);
});

ava(
	'Add custom route in beforeRoutingControllerLaunchHook (imagine a proxy)',
	async (t: Assertions) => {
		stdMock.use({ print: commons.print });
		const { server } = await N9NodeRouting({
			hasProxy: true, // tell n9NodeRouting to parse `session` header
			http: {
				port: 6001,
				beforeRoutingControllerLaunchHook: ({ expressApp, log }) => {
					expressApp.use('/custom-endpoint', (req: Request, res: Response, next: NextFunction) => {
						log.info(`A message in the endpoint`);
						res.json({ response: 1 });
						next();
					});
				},
			},
			conf: defaultNodeRoutingConfOptions,
		});
		stdMock.flush();
		const httpClient = new N9HttpClient(new N9Log('test'));

		/*
		 ** Test ping route
		 */
		const rep = await httpClient.get<any>('http://localhost:6001/custom-endpoint');
		t.deepEqual(rep, { response: 1 }, 'Endpoint should respond some data');

		// Clear stdout
		stdMock.restore();
		stdMock.flush();
		// Close server
		await closeServer(server);
	},
);
