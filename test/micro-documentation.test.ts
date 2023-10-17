import { N9Error } from '@neo9/n9-node-utils';
import test, { ExecutionContext } from 'ava';
import * as fs from 'fs';
import { join } from 'path';

import { generateDocumentationJsonToFile } from '../src';
import { Options } from '../src/models/routing';
import { init, mockAndCatchStd, TestContext, urlPrefix } from './fixtures';

const { runBeforeTest } = init('micro-validate', {
	avoidBeforeEachHook: true,
});

test('Read documentation', async (t: ExecutionContext<TestContext>) => {
	await runBeforeTest(t, {
		n9NodeRoutingOptions: {
			openapi: {
				generateDocumentationOnTheFly: true,
			},
		},
	});

	await mockAndCatchStd(async () => {
		// Check /documentation
		const res = await t.context.httpClient.get<any>([urlPrefix, 'documentation.json']);

		t.is(res.info.title, '@neo9/n9-node-routing');
		t.is(Object.keys(res.paths).length, 3);
	});
});

test('Read documentation fail because its not generated', async (t: ExecutionContext<TestContext>) => {
	await runBeforeTest(t);

	await mockAndCatchStd(async () => {
		// Check /documentation
		const n9Error = await t.throwsAsync<N9Error>(
			async () => await t.context.httpClient.get([urlPrefix, 'documentation.json']),
		);

		t.is(n9Error.status, 404);
		t.is(n9Error.message, 'generated-documentation-not-found');
	});
});

test('Read documentation fail in production environment', async (t: ExecutionContext<TestContext>) => {
	await runBeforeTest(t, {
		nodeEnvValue: 'production',
		n9NodeRoutingOptions: {
			openapi: {
				generateDocumentationOnTheFly: true,
			},
		},
	});

	await mockAndCatchStd(async () => {
		// Check /documentation
		const res = await t.throwsAsync<N9Error>(
			async () => await t.context.httpClient.get([urlPrefix, 'documentation.json']),
		);

		t.is(res.status, 404);
		t.is(res.message, 'not-found');
	});
});

test('Read documentation generated first', async (t: ExecutionContext<TestContext>) => {
	const microValidatePath = join(__dirname, 'fixtures', 'micro-validate', 'modules');
	const options: Options = { path: microValidatePath };
	const generatedFilePath = generateDocumentationJsonToFile(options);
	await runBeforeTest(t, {
		n9NodeRoutingOptions: {
			...options,
		},
	});

	// Check /documentation
	const res = await t.context.httpClient.get<any>([urlPrefix, 'documentation.json']);

	t.is(res.info.title, '@neo9/n9-node-routing');
	t.is(Object.keys(res.paths).length, 3);

	fs.unlinkSync(generatedFilePath);
});
