import test, { ExecutionContext } from 'ava';

import { init, TestContext, urlPrefix } from './fixtures';

const { runBeforeTest } = init('micro-default-values', {
	avoidBeforeEachHook: true,
});

test('Check default values are set', async (t: ExecutionContext<TestContext>) => {
	await runBeforeTest(t);

	const paramsReceived: any = await t.context.httpClient.post(
		[urlPrefix, 'default-values'],
		{
			defaultString: undefined,
			fieldWithValue: 0,
			fieldWithValue2: null,
			fieldWithValue3: 'something',
		},
		{
			queryParamWithValue1: 0,
			queryParamWithValue2: null,
			queryParamWithValue3: 'something',
		},
		{},
	);

	t.deepEqual(
		paramsReceived.body,
		{
			defaultNumber: 0,
			defaultString: 'default-string-value-expected',
			fieldWithValue: 0,
			fieldWithValue2: null,
			fieldWithValue3: 'something',
		},
		'body ok',
	);
	t.deepEqual(
		paramsReceived.queryParams,
		{
			defaultNumber: 0,
			defaultString: 'default-string-value-expected',
			fieldWithValue: 5,
			fieldWithValue2: 'value', // null in query params are not preserved
			fieldWithValue3: 'default-value',
		},
		'queryParams ok',
	);
	t.deepEqual(
		paramsReceived.headers,
		{
			defaultNumber: 0,
			defaultString: 'default-string-value-expected',
			fieldWithValue: 5,
			fieldWithValue2: 'value', // null in headers are not preserved
			fieldWithValue3: 'default-value',
		},
		'headers ok',
	);
});

test('Should throw error if module path is not found', async (t: ExecutionContext<TestContext>) => {
	// throw an error because there is no conf in n9NodeRouting
	const error = await t.throwsAsync(
		runBeforeTest(t, {
			n9NodeRoutingOptions: {
				path: './a-folder-that-does-not-exists',
			},
		}), // not using mockAndCatchStdOptions: { throwError: false }, this time
	);

	t.true(!!error);
	t.is(error.message, 'modules-path-not-found', 'Error message is the one expected');
});
