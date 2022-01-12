import ava, { Assertions } from 'ava';
import * as _ from 'lodash';
import { join } from 'path';
import * as stdMock from 'std-mocks';

import { N9NodeRouting } from '../src';
import { applyDefaultValuesOnOptions } from '../src/options';
import { getEnvironment } from '../src/utils';
import commons from './fixtures/commons';

const microValidate = join(__dirname, 'fixtures/micro-validate/');

ava('Read documentation', (t: Assertions) => {
	stdMock.use({ print: commons.print });
	const environment = getEnvironment();

	const initOptions: N9NodeRouting.Options = {
		path: microValidate,
	};

	const optionsWithDefault: N9NodeRouting.Options = _.cloneDeep(initOptions);
	applyDefaultValuesOnOptions(optionsWithDefault, environment, 'fake-ap-name');
	const optionsWithDefault2: N9NodeRouting.Options = _.cloneDeep(optionsWithDefault);
	applyDefaultValuesOnOptions(optionsWithDefault2, environment, 'fake-ap-name');

	// Check logs
	stdMock.restore();
	stdMock.flush();
	t.notDeepEqual(initOptions, optionsWithDefault, 'Default options are filled');
	t.true(optionsWithDefault.openapi.isEnable, 'OpenApi enabled by default'); // test only on default value, the goal is not to test default values assigment
	t.deepEqual(optionsWithDefault2, optionsWithDefault, 'Apply twice is the same than once');
});
