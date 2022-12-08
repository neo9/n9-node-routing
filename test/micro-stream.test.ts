import { N9JSONStreamResponse } from '@neo9/n9-node-utils';
import ava, { Assertions } from 'ava';
import { join } from 'path';
import * as stdMock from 'std-mocks';

// tslint:disable-next-line:import-name
import N9NodeRouting from '../src';
import commons, { closeServer, defaultNodeRoutingConfOptions } from './fixtures/commons';

const microFoo = join(__dirname, 'fixtures/micro-stream/');

ava('Basic stream', async (t: Assertions) => {
	stdMock.use({ print: commons.print });
	const { server } = await N9NodeRouting({
		path: microFoo,
		http: { port: 6001 },
		conf: defaultNodeRoutingConfOptions,
	});

	const res = await commons.jsonHttpClient.get<N9JSONStreamResponse<{ _id: string }>>(
		'http://localhost:6001/users',
	);
	t.is(res.items.length, 4, 'check length');
	t.is(typeof res.metaData, 'object', 'metadata is object');

	// Close server
	await closeServer(server);
});
