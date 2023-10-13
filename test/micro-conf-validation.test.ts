import test, { ExecutionContext } from 'ava';
import { join } from 'path';
import { Container } from 'typedi';

import { init, TestContext, urlPrefix } from './fixtures';
import { Conf as InvalidConf } from './fixtures/common-conf-validation/configuration-invalid/conf/index.models';
import { Conf as ValidConf } from './fixtures/common-conf-validation/configuration-valid/conf/index.models';
import { Conf as ValidConfWithWhitelistErrors } from './fixtures/common-conf-validation/configuration-valid-with-additional-attributes/conf/index.models';

const microConfValidation = join(__dirname, 'fixtures/common-conf-validation/');

const { runBeforeTest } = init('common-conf-validation', {
	avoidBeforeEachHook: true,
	nodeEnvValue: 'development',
});

test('Should be a valid configuration', async (t: ExecutionContext<TestContext>) => {
	const microPath = `${microConfValidation}/configuration-valid`;
	await runBeforeTest(t, {
		n9NodeRoutingOptions: {
			conf: {
				n9NodeConf: {
					path: `${microPath}/conf`,
				},
				validation: {
					isEnabled: true,
					classType: ValidConf,
					formatWhitelistErrors: true,
				},
			},
		},
	});

	t.true(t.context.stdout[3].includes('Checking configuration'), 'Should check configuration');
	t.true(t.context.stdout[4].includes('Configuration is valid'), 'Should be a valid configuration');
	t.true(t.context.stdout[5].includes('Listening on port'), 'Should listen on port');

	t.true(t.context.stdLength === 10, 'Should have 10 lines of logs');
});

test('Should not be a valid configuration (not formatted)', async (t: ExecutionContext<TestContext>) => {
	const microPath = `${microConfValidation}/configuration-invalid`;
	await runBeforeTest(t, {
		n9NodeRoutingOptions: {
			conf: {
				n9NodeConf: {
					path: `${microPath}/conf`,
				},
				validation: {
					isEnabled: true,
					classType: InvalidConf,
					formatValidationErrors: false,
					formatWhitelistErrors: false,
				},
			},
		},
		mockAndCatchStdOptions: {
			throwError: false,
		},
	});

	t.true(t.context.stdout[0].includes('---------'), 'Should display --------');
	t.true(t.context.stdout[1].includes('env: development'), 'Should display env');
	t.true(t.context.stdout[2].includes('---------'), 'Should display -------- 2nd line');
	t.is(t.context.stdout[2].length, t.context.stdout[0].length, 'Should have same length for ----');
	t.is(
		t.context.stdout[2].length,
		t.context.stdout[1].length,
		'Should have same length for ---- and init message',
	);
	t.true(t.context.stdout[3].includes('Checking configuration'), 'Should check configuration');

	t.true(
		t.context.runBeforeTestError.message === 'Configuration is not valid',
		'Should not be a valid configuration',
	);

	const validationErrors = t.context.runBeforeTestError.context.validationErrors;
	t.true(validationErrors.length === 2, 'Should have 2 validation errors');

	const barError = validationErrors[0];
	t.true(barError.property === 'bar', 'Should have bar property');
	t.true(
		barError.constraints.isNumber ===
			'bar must be a number conforming to the specified constraints',
		'Should have isNumber constraint',
	);
	t.true(
		barError.constraints.isIn === 'bar must be one of the following values: 1, 2',
		'Should have isIn constraint',
	);

	const bazError = validationErrors[1];
	t.true(bazError.property === 'baz', 'Should have baz property');
	t.true(bazError.children.length === 1, 'Should have 1 child');

	const quxError = bazError.children[0];
	t.true(quxError.property === 'qux', 'Should have qux property');
	t.true(
		quxError.constraints.isString === 'qux must be a string',
		'Should have isString constraint',
	);
});

test('Should not be a valid configuration (formatted)', async (t: ExecutionContext<TestContext>) => {
	const microPath = `${microConfValidation}/configuration-invalid`;
	await runBeforeTest(t, {
		n9NodeRoutingOptions: {
			conf: {
				n9NodeConf: {
					path: `${microPath}/conf`,
				},
				validation: {
					isEnabled: true,
					classType: InvalidConf,
					formatValidationErrors: true,
					formatWhitelistErrors: false,
				},
			},
		},
		mockAndCatchStdOptions: {
			throwError: false,
		},
	});
	t.true(t.context.stdout[0].includes('---------'), 'Should display --------');
	t.true(t.context.stdout[1].includes('env: development'), 'Should display env');
	t.true(t.context.stdout[2].includes('---------'), 'Should display -------- 2nd line');
	t.is(t.context.stdout[2].length, t.context.stdout[0].length, 'Should have same length for ----');
	t.is(
		t.context.stdout[2].length,
		t.context.stdout[1].length,
		'Should have same length for ---- and init message',
	);
	t.true(t.context.stdout[3].includes('Checking configuration'), 'Should check configuration');
	t.true(
		t.context.stderr[0].includes('Configuration is not valid:'),
		'Should not be a valid configuration',
	);
	t.true(
		t.context.stderr[1].includes('Attribute bar is not valid - isIn'),
		'Should have isIn error',
	);
	t.true(
		t.context.stderr[2].includes('Attribute bar is not valid - isNumber'),
		'Should have isNumber error',
	);
	t.true(
		t.context.stderr[3].includes('Attribute baz.qux is not valid - isString'),
		'Should have isString error',
	);

	t.true(
		t.context.runBeforeTestError.message === 'Configuration is not valid',
		'Should not be a valid configuration (in error message)',
	);
	t.true(
		t.context.runBeforeTestError.context.validationErrors[0].constraints.isNumber.includes(
			'bar must be a number',
		),
		'Should have isNumber constraint (in error message)',
	);
});

test('Should not show exclude properties in logs on validation error (not formatted)', async (t: ExecutionContext<TestContext>) => {
	const microPath = `${microConfValidation}/configuration-invalid`;
	await runBeforeTest(t, {
		n9NodeRoutingOptions: {
			conf: {
				n9NodeConf: {
					path: `${microPath}/conf`,
				},
				validation: {
					isEnabled: true,
					classType: InvalidConf,
					formatValidationErrors: true,
					formatWhitelistErrors: false,
				},
			},
		},
		mockAndCatchStdOptions: {
			throwError: false,
		},
	});

	t.true(
		t.context.stdout.filter((line) => line.includes('secretPassword')).length === 0,
		'Should not show secretPassword in logs',
	);

	t.true(
		!t.context.runBeforeTestError.message.includes('secretPassword'),
		'Should not show secretPassword in error',
	);
	t.true(
		!JSON.stringify(t.context.runBeforeTestError.context).includes('secretPassword'),
		'Should not show secretPassword in error context',
	);
});

test('Should not show exclude properties in logs on validation error (formatted logs)', async (t: ExecutionContext<TestContext>) => {
	const microPath = `${microConfValidation}/configuration-invalid`;
	await runBeforeTest(t, {
		n9NodeRoutingOptions: {
			conf: {
				n9NodeConf: {
					path: `${microPath}/conf`,
				},
				validation: {
					isEnabled: true,
					classType: InvalidConf,
					formatValidationErrors: true,
					formatWhitelistErrors: true,
				},
			},
		},
		mockAndCatchStdOptions: {
			throwError: false,
		},
	});

	t.true(
		t.context.stdout.filter((line) => line.includes('secretPassword')).length === 0,
		'Should not show secretPassword in logs',
	);

	t.true(
		!t.context.runBeforeTestError.message.includes('secretPassword'),
		'Should not show secretPassword in error',
	);
	t.true(
		!JSON.stringify(t.context.runBeforeTestError.context).includes('secretPassword'),
		'Should not show secretPassword in error context',
	);
});

test('Should be a valid configuration with whitelist errors (formatted) → default case', async (t: ExecutionContext<TestContext>) => {
	const microPath = `${microConfValidation}/configuration-valid-with-additional-attributes`;
	await runBeforeTest(t, {
		n9NodeRoutingOptions: {
			conf: {
				n9NodeConf: {
					path: `${microPath}/conf`,
				},
				validation: {
					classType: ValidConfWithWhitelistErrors,
				},
			},
		},
		mockAndCatchStdOptions: {
			throwError: false,
		},
	});

	t.true(t.context.stdout[3].includes('Checking configuration'), 'Should check configuration');
	t.true(
		t.context.stdout[4].includes('Configuration contains unexpected attributes'),
		'Should have whitelist errors',
	);
	t.true(
		t.context.stdout[5].includes("Please remove attribute 'whitelist1'"),
		'Should have whitelist1 error',
	);
	t.true(
		t.context.stdout[6].includes("Please remove attribute 'whitelist2'"),
		'Should have whitelist2 error',
	);
	t.true(
		t.context.stdout[7].includes("Please remove attribute 'baz.qux'"),
		'Should have baz.qux error',
	);
	t.true(t.context.stdout[8].includes('Configuration is valid'), 'Should be a valid configuration');
	t.true(t.context.stdout[9].includes('Listening on port'), 'Should listen on port');
});

test('Should be a valid configuration with whitelist errors (not formatted)', async (t: ExecutionContext<TestContext>) => {
	const microPath = `${microConfValidation}/configuration-valid-with-additional-attributes`;
	await runBeforeTest(t, {
		n9NodeRoutingOptions: {
			conf: {
				n9NodeConf: {
					path: `${microPath}/conf`,
				},
				validation: {
					classType: ValidConfWithWhitelistErrors,
					formatWhitelistErrors: false,
				},
			},
		},
	});

	t.true(t.context.stdout[3].includes('Checking configuration'), 'Should check configuration');

	t.true(
		t.context.stdout[4].includes('Configuration contains unexpected attributes'),
		'Should have whitelist errors',
	);
	t.true(
		t.context.stdout[6].includes('property qux should not exist'),
		'Should have whitelist1 error',
	);
	t.true(
		t.context.stdout[6].includes('property whitelist1 should not exist'),
		'Should have whitelist1 error',
	);
	t.true(
		t.context.stdout[6].includes('property whitelist2 should not exist'),
		'Should have whitelist2 error',
	);

	t.true(t.context.stdout[8].includes('Configuration is valid'), 'Should be a valid configuration');
	t.true(t.context.stdout[9].includes('Listening on port'), 'Should listen on port');
});

for (const formatWhitelistErrors of [true, false]) {
	test(`Should not show exclude properties on whitelist errors (${
		formatWhitelistErrors ? '' : 'not '
	}formatted)`, async (t: ExecutionContext<TestContext>) => {
		const microPath = `${microConfValidation}/configuration-valid-with-additional-attributes`;
		await runBeforeTest(t, {
			n9NodeRoutingOptions: {
				conf: {
					n9NodeConf: {
						path: `${microPath}/conf`,
					},
					validation: {
						isEnabled: true,
						classType: ValidConfWithWhitelistErrors,
						formatWhitelistErrors: true,
					},
				},
			},
		});

		t.true(
			t.context.stdout.filter((line) => line.includes('secretPassword')).length === 0,
			'Should not show secretPassword in logs',
		);
	});
}

test('Secret should be usable in conf', async (t: ExecutionContext<TestContext>) => {
	const microPath = `${microConfValidation}/configuration-valid-with-additional-attributes`;
	await runBeforeTest(t, {
		n9NodeRoutingOptions: {
			conf: {
				n9NodeConf: {
					path: `${microPath}/conf`,
				},
				validation: {
					isEnabled: true,
					classType: ValidConfWithWhitelistErrors,
					formatWhitelistErrors: true,
				},
			},
		},
	});
	const conf = Container.get(ValidConfWithWhitelistErrors);

	t.is(conf.secret, 'secretPassword', `Secret is usable in conf`);
	t.is(conf.secretOpaque, 'secretPasswordHiddenButKnownIfNil', `Secret opaque is usable in conf`);
	t.is(conf.secretOpaqueNil, undefined, `Secret opaque nil is usable in conf`);
	t.is(conf.secretInvisible, 'secretPasswordInvisible', `Secret invisible is usable in conf`);
	t.is(
		conf.secretUri,
		'mongodb://myDBReader:secretPassword@mongodb0.example.com:27017/?authSource=admin',
		`Secret uri is usable in conf`,
	);
	t.is(
		conf.secretUriNotAnURI,
		'mongodb://myDBReader:secretPasswordmongodb0.example.com:27017/?authSource=admin',
		`Secret uri not an uri is usable in conf`,
	);
});

test('Secret should not be exposed', async (t: ExecutionContext<TestContext>) => {
	const microPath = `${microConfValidation}/configuration-valid-with-additional-attributes`;
	await runBeforeTest(t, {
		n9NodeRoutingOptions: {
			conf: {
				n9NodeConf: {
					path: `${microPath}/conf`,
				},
				validation: {
					isEnabled: true,
					classType: ValidConfWithWhitelistErrors,
					formatWhitelistErrors: true,
				},
			},
		},
	});

	const exposedConf = await t.context.httpClient.get<ValidConfWithWhitelistErrors>([
		urlPrefix,
		'conf',
	]);

	t.is(exposedConf.foo, 'string', `Conf is available on http endpoint`);
	t.is(exposedConf.secret, undefined, `Secret should not be exposed on conf endpoint`);
	t.is(exposedConf.secretInvisible, undefined, `Secret invisible should be exposed as undefined`);
	t.is(
		exposedConf.secretOpaque,
		'********',
		`Secret opaque should not be exposed on conf endpoint`,
	);
	t.deepEqual(
		exposedConf.secretOpaqueArray,
		['********', '********'],
		`Secret opaque array should not be exposed on conf endpoint`,
	);
	t.is(
		exposedConf.secretOpaqueNil,
		undefined,
		`Secret opaque should be undefined if value is undefined`,
	);
	t.is(
		exposedConf.secretUri,
		'mongodb://myDBReader:********@mongodb0.example.com:27017/?authSource=admin',
		`Secret uri should be exposed but not password`,
	);
	t.is(
		exposedConf.secretUriArray.length,
		3,
		`Secret uri array should be exposed and contain 3 elements`,
	);
	t.deepEqual(
		exposedConf.secretUriArray,
		[
			'mongodb://myDBReader:********@mongodb0.example.com:27017/?authSource=admin',
			'mongodb://myDBReader:********@mongodb0.example.com:27017/?authSource=admin',
			null,
		],
		`Secret uri array should be exposed without password if matching uri regex otherwise null`,
	);
	t.is(
		exposedConf.secretUriNotAnURI,
		undefined,
		`Secret uri not an URI is completely hidden to avoid error`,
	);
});

test('Should not proceed any validation - no validation options given', async (t: ExecutionContext<TestContext>) => {
	const microPath = `${microConfValidation}/configuration-valid-with-additional-attributes`;
	await runBeforeTest(t, {
		n9NodeRoutingOptions: {
			conf: {
				n9NodeConf: {
					path: `${microPath}/conf`,
				},
			},
		},
	});

	t.true(
		t.context.stdout[3].includes('Configuration validation is disabled'),
		'Should not check configuration',
	);
	t.true(t.context.stdout[4].includes('Listening on port'), 'Should listen on port');
});

test('Should not proceed any validation - validation is disabled', async (t: ExecutionContext<TestContext>) => {
	const microPath = `${microConfValidation}/configuration-invalid`;
	await runBeforeTest(t, {
		n9NodeRoutingOptions: {
			conf: {
				n9NodeConf: {
					path: `${microPath}/conf`,
				},
				validation: {
					isEnabled: false,
					classType: InvalidConf,
				},
			},
		},
	});

	t.true(
		t.context.stdout[3].includes('Configuration validation is disabled'),
		'Should not check configuration',
	);
	t.true(t.context.stdout[4].includes('Listening on port'), 'Should listen on port');
});

test('Should not proceed any validation - validation is disabled from the configuration extension', async (t: ExecutionContext<TestContext>) => {
	const microPath = `${microConfValidation}/configuration-invalid`;
	const extensionPath = join(
		__dirname,
		'fixtures',
		'common-conf-validation',
		'configuration-invalid',
		'configuration-extension.json',
	);
	await runBeforeTest(t, {
		n9NodeRoutingOptions: {
			conf: {
				n9NodeConf: {
					path: `${microPath}/conf`,
					extendConfig: {
						path: {
							absolute: extensionPath,
						},
						key: 'apiName',
					},
				},
				validation: {
					isEnabled: true,
					classType: InvalidConf,
				},
			},
		},
	});

	t.true(
		t.context.stdout[3].includes('Configuration validation is disabled'),
		'Should not check configuration',
	);
	t.true(t.context.stdout[4].includes('Listening on port'), 'Should listen on port');
});

test('Should not proceed any validation - validation is enabled but the class type of the configuration is not set', async (t: ExecutionContext<TestContext>) => {
	const microPath = `${microConfValidation}/configuration-valid`;
	await runBeforeTest(t, {
		n9NodeRoutingOptions: {
			conf: {
				n9NodeConf: {
					path: `${microPath}/conf`,
				},
				validation: {
					isEnabled: true,
				},
			},
		},
		mockAndCatchStdOptions: {
			throwError: false,
		},
	});

	t.true(t.context.runBeforeTestError.status === 500, 'Should throw a 500 error');
	t.true(
		t.context.runBeforeTestError.message.includes(
			'N9NodeRouting configuration validation options are not correct',
		),
		'Options are not correct',
	);
	t.true(
		t.context.runBeforeTestError.message.includes(
			'validation is enabled but no classType is given',
		),
		'No class type given',
	);
});
