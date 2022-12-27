import ava, { Assertions } from 'ava';
import { join } from 'path';
import * as stdMock from 'std-mocks';

// tslint:disable-next-line:import-name
import N9NodeRouting from '../src';
import commons, { closeServer, defaultNodeRoutingConfOptions } from './fixtures/commons';

const microDefaultValues = join(__dirname, 'fixtures/micro-default-values/');

ava('Check default values are set', async (t: Assertions) => {
	stdMock.use({ print: commons.print });

	const { server } = await N9NodeRouting({
		path: microDefaultValues,
		http: { port: 5585 },
		enableLogFormatJSON: false,
		conf: defaultNodeRoutingConfOptions,
	});

	const paramsReceived: any = await commons.jsonHttpClient.post(
		'http://localhost:5585/default-values',
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

	// Check logs
	stdMock.restore();
	stdMock.flush();
	// Close server
	await closeServer(server);
});
