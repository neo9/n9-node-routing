import test, { ExecutionContext } from 'ava';
import * as _ from 'lodash';
import { join } from 'path';

import { N9NodeRouting } from '../src';
import { applyDefaultValuesOnOptions } from '../src/options';
import { getEnvironment } from '../src/utils';
import { mockAndCatchStd, TestContext } from './fixtures';

const microValidate = join(__dirname, 'fixtures/micro-validate/');

test('Read documentation', async (t: ExecutionContext<TestContext>) => {
	await mockAndCatchStd(() => {
		const environment = getEnvironment();

		const initOptions: N9NodeRouting.Options = {
			path: microValidate,
		};

		const optionsWithDefault: N9NodeRouting.Options = _.cloneDeep(initOptions);
		applyDefaultValuesOnOptions(optionsWithDefault, environment, 'fake-app-name');
		const optionsWithDefault2: N9NodeRouting.Options = _.cloneDeep(optionsWithDefault);
		applyDefaultValuesOnOptions(optionsWithDefault2, environment, 'fake-app-name');

		t.notDeepEqual(initOptions, optionsWithDefault, 'Default options are filled');

		t.true(optionsWithDefault.openapi.isEnabled, 'OpenApi enabled by default'); // test only one default value, the goal is not to test default values assigment

		// logs has Pino circular references
		delete optionsWithDefault2.log;
		delete optionsWithDefault.log;
		t.deepEqual(optionsWithDefault2, optionsWithDefault, 'Apply twice is the same than once');
	});
});
