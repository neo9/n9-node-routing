import test, { Assertions } from 'ava';
import { join } from 'path';
import got from 'got';
import * as stdMock from 'std-mocks';

import N9NodeRouting from '../src';
import commons, { closeServer } from './fixtures/commons';

const MICRO_VALIDATE = join(__dirname, 'fixtures/micro-validate/');

test('Read documentation', async (t: Assertions) => {
	stdMock.use({ print: commons.print });
	const { server } = await N9NodeRouting({
		path: MICRO_VALIDATE,
	});

	// Check /documentation
	const res = got({ url: 'http://localhost:5000/documentation.json' });
	const body = (await res.json()) as any;

	// Check logs
	stdMock.restore();
	stdMock.flush();
	t.is((await res).statusCode, 200);
	t.is(body.info.title, 'n9-node-routing');
	t.is(Object.keys(body.paths).length, 3);

	// Close server
	await closeServer(server);
});
