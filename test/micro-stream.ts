import test, { Assertions } from 'ava';
import { join } from 'path';
import * as stdMock from 'std-mocks';

import N9NodeRouting from '../src';
import commons, { closeServer } from './fixtures/commons';
import { N9JsonStreamResponse } from '@neo9/n9-node-utils';

const MICRO_FOO = join(__dirname, 'fixtures/micro-stream/');

test('Basic stream', async (t: Assertions) => {
	stdMock.use({ print: commons.print });
	const { server } = await N9NodeRouting({
		path: MICRO_FOO,
		http: { port: 6001 },
	});

	const res = await commons.jsonHttpClient.get<N9JsonStreamResponse<{ _id: string }>>(
		'http://localhost:6001/users',
	);
	t.is(res.items.length, 4, 'check length');
	t.is(typeof res.metaData, 'object', 'metadata is object');

	// Close server
	await closeServer(server);
});
