import { N9Error } from '@neo9/n9-node-utils';
import ava, { Assertions } from 'ava';
import * as fs from 'fs';
import got from 'got';
import { join } from 'path';
import * as stdMock from 'std-mocks';

// tslint:disable-next-line:import-name
import N9NodeRouting from '../src';
import { generateDocumentationJsonToFile } from '../src/generate-documentation-json';
import { Options } from '../src/models/routing/index';
import commons, { defaultNodeRoutingConfOptions } from './fixtures/commons';
import { end } from './fixtures/helper';

const microValidatePath = join(__dirname, 'fixtures/micro-validate/modules');

ava('Read documentation', async (t: Assertions) => {
	stdMock.use({ print: commons.print });
	const { server, prometheusServer } = await N9NodeRouting({
		path: microValidatePath,
		openapi: {
			generateDocumentationOnTheFly: true,
		},
		conf: defaultNodeRoutingConfOptions,
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
	await end(server, prometheusServer);
});

ava('Read documentation fail because its not generated', async (t: Assertions) => {
	stdMock.use({ print: commons.print });
	const { server, prometheusServer } = await N9NodeRouting({
		path: microValidatePath,
		conf: defaultNodeRoutingConfOptions,
	});

	// Check /documentation
	const res = await t.throwsAsync<N9Error>(
		async () => await commons.jsonHttpClient.get('http://localhost:5000/documentation.json'),
	);

	// Check logs
	stdMock.restore();
	stdMock.flush();
	t.is(res.status, 404);
	t.is(res.message, 'generated-documentation-not-found');

	// Close server
	await end(server, prometheusServer);
});

ava('Read documentation fail in production environment', async (t: Assertions) => {
	stdMock.use({ print: commons.print });
	const env = process.env.NODE_ENV;
	process.env.NODE_ENV = 'production';
	const { server, prometheusServer } = await N9NodeRouting({
		path: microValidatePath,
		openapi: {
			generateDocumentationOnTheFly: true,
		},
		conf: defaultNodeRoutingConfOptions,
	});

	// Check /documentation
	const res = await t.throwsAsync<N9Error>(
		async () => await commons.jsonHttpClient.get('http://localhost:5000/documentation.json'),
	);

	// Check logs
	stdMock.restore();
	stdMock.flush();
	t.is(res.status, 404);
	t.is(res.message, 'not-found');

	// Close server
	await end(server, prometheusServer);
	process.env.NODE_ENV = env;
});

ava('Read documentation generated first', async (t: Assertions) => {
	stdMock.use({ print: commons.print });
	const options: Options = {
		path: microValidatePath,
	};
	const generatedFilePath = generateDocumentationJsonToFile(options);
	const { server, prometheusServer } = await N9NodeRouting(options);

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
	await end(server, prometheusServer);
	fs.unlinkSync(generatedFilePath);
});
