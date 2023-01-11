import { N9Error } from '@neo9/n9-node-utils';
import ava, { Assertions } from 'ava';
import { join } from 'path';
import * as tmp from 'tmp-promise';

import N9NodeRouting from '../src';
import { Conf as InvalidConf } from './fixtures/common-conf-validation/configuration-invalid/conf/index.models';
import { Conf as ValidConf } from './fixtures/common-conf-validation/configuration-valid/conf/index.models';
import { Conf as ValidConfWithWhitelistErrors } from './fixtures/common-conf-validation/configuration-valid-with-additional-attributes/conf/index.models';
import commons from './fixtures/commons';
import { end, getLogsFromFile } from './fixtures/helper';

const microConfValidation = join(__dirname, 'fixtures/common-conf-validation/');

ava.beforeEach(() => {
	delete (global as any).log;
	delete (global as any).conf;
});

ava('Should be a valid configuration', async (t: Assertions) => {
	process.env.NODE_ENV = 'development';
	const file = await tmp.file();
	const microPath = `${microConfValidation}/configuration-valid`;

	const { server, prometheusServer } = await N9NodeRouting({
		path: microPath,
		logOptions: { developmentOutputFilePath: file.path },
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
	});

	const output = await getLogsFromFile(file.path);

	t.true(output[3].includes('Checking configuration'), 'Should check configuration');
	t.true(output[4].includes('Configuration is valid'), 'Should be a valid configuration');
	t.true(output[5].includes('Listening on port'), 'Should listen on port');
	t.true(output.length === 7, 'Should have 5 lines of logs');

	// Close server	// Close server
	await end(server, prometheusServer);
});

ava('Should not be a valid configuration (not formatted)', async (t: Assertions) => {
	process.env.NODE_ENV = 'development';
	const file = await tmp.file();
	const microPath = `${microConfValidation}/configuration-invalid`;

	const errors: N9Error = await t.throwsAsync(
		N9NodeRouting({
			path: microPath,
			logOptions: { developmentOutputFilePath: file.path },
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
		}),
	);

	const output = await getLogsFromFile(file.path);

	t.true(output[0].includes('---------'), 'Should display --------');
	t.true(output[1].includes('env: development'), 'Should display env');
	t.true(output[2].includes('---------'), 'Should display -------- 2nd line');
	t.is(output[2].length, output[0].length, 'Should have same length for ----');
	t.is(output[2].length, output[1].length, 'Should have same length for ---- and init message');
	t.true(output[3].includes('Checking configuration'), 'Should check configuration');
	t.true(errors.message === 'Configuration is not valid', 'Should not be a valid configuration');

	const validationErrors = errors.context.validationErrors;
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

ava('Should not be a valid configuration (formatted)', async (t: Assertions) => {
	process.env.NODE_ENV = 'development';
	const file = await tmp.file();
	const microPath = `${microConfValidation}/configuration-invalid`;

	const errors: N9Error = await t.throwsAsync(
		N9NodeRouting({
			path: microPath,
			logOptions: { developmentOutputFilePath: file.path },
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
		}),
	);

	const output = await getLogsFromFile(file.path);

	t.true(output[0].includes('---------'), 'Should display --------');
	t.true(output[1].includes('env: development'), 'Should display env');
	t.true(output[2].includes('---------'), 'Should display -------- 2nd line');
	t.is(output[2].length, output[0].length, 'Should have same length for ----');
	t.is(output[2].length, output[1].length, 'Should have same length for ---- and init message');
	t.true(output[3].includes('Checking configuration'), 'Should check configuration');
	t.true(output[4].includes('Configuration is not valid:'), 'Should not be a valid configuration');
	t.true(output[5].includes('Attribute bar is not valid - isIn'), 'Should have isIn error');
	t.true(output[6].includes('Attribute bar is not valid - isNumber'), 'Should have isNumber error');
	t.true(
		output[7].includes('Attribute baz.qux is not valid - isString'),
		'Should have isString error',
	);

	t.true(
		errors.message === 'Configuration is not valid',
		'Should not be a valid configuration (in error message)',
	);
	t.true(
		errors.context.validationErrors[0].constraints.isNumber.includes('bar must be a number'),
		'Should have isNumber constraint (in error message)',
	);
});

ava(
	'Should not show exclude properties in logs on validation error (not formatted)',
	async (t: Assertions) => {
		process.env.NODE_ENV = 'development';
		const file = await tmp.file();
		const microPath = `${microConfValidation}/configuration-invalid`;

		const errors: N9Error = await t.throwsAsync(
			N9NodeRouting({
				path: microPath,
				logOptions: { developmentOutputFilePath: file.path },
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
			}),
		);

		const output = await getLogsFromFile(file.path);

		t.true(
			output.filter((line) => line.includes('secretPassword')).length === 0,
			'Should not show secretPassword in logs',
		);

		t.true(!errors.message.includes('secretPassword'), 'Should not show secretPassword in error');
		t.true(
			!JSON.stringify(errors.context).includes('secretPassword'),
			'Should not show secretPassword in error context',
		);
	},
);

ava(
	'Should not show exclude properties in logs on validation error (formatted logs)',
	async (t: Assertions) => {
		process.env.NODE_ENV = 'development';
		const file = await tmp.file();
		const microPath = `${microConfValidation}/configuration-invalid`;

		const errors: N9Error = await t.throwsAsync(
			N9NodeRouting({
				path: microPath,
				logOptions: { developmentOutputFilePath: file.path },
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
			}),
		);

		const output = await getLogsFromFile(file.path);

		t.true(
			output.filter((line) => line.includes('secretPassword')).length === 0,
			'Should not show secretPassword in logs',
		);

		t.true(!errors.message.includes('secretPassword'), 'Should not show secretPassword in error');
		t.true(
			!JSON.stringify(errors.context).includes('secretPassword'),
			'Should not show secretPassword in error context',
		);
	},
);

ava(
	'Should be a valid configuration with whitelist errors (formatted) → default case',
	async (t: Assertions) => {
		process.env.NODE_ENV = 'development';
		const file = await tmp.file();
		const microPath = `${microConfValidation}/configuration-valid-with-additional-attributes`;

		const { server, prometheusServer } = await N9NodeRouting({
			path: microPath,
			logOptions: { developmentOutputFilePath: file.path },
			conf: {
				n9NodeConf: {
					path: `${microPath}/conf`,
				},
				validation: {
					classType: ValidConfWithWhitelistErrors,
				},
			},
		});

		const output = await getLogsFromFile(file.path);

		t.true(output[3].includes('Checking configuration'), 'Should check configuration');
		t.true(
			output[4].includes('Configuration contains unexpected attributes'),
			'Should have whitelist errors',
		);
		t.true(
			output[5].includes("Please remove attribute 'whitelist1'"),
			'Should have whitelist1 error',
		);
		t.true(
			output[6].includes("Please remove attribute 'whitelist2'"),
			'Should have whitelist2 error',
		);
		t.true(output[7].includes("Please remove attribute 'baz.qux'"), 'Should have baz.qux error');
		t.true(output[8].includes('Configuration is valid'), 'Should be a valid configuration');
		t.true(output[9].includes('Listening on port'), 'Should listen on port');

		await end(server, prometheusServer); // Close server
		await end(server, prometheusServer);
	},
);

ava(
	'Should be a valid configuration with whitelist errors (not formatted)',
	async (t: Assertions) => {
		process.env.NODE_ENV = 'development';
		const file = await tmp.file();
		const microPath = `${microConfValidation}/configuration-valid-with-additional-attributes`;

		const { server, prometheusServer } = await N9NodeRouting({
			path: microPath,
			logOptions: { developmentOutputFilePath: file.path },
			conf: {
				n9NodeConf: {
					path: `${microPath}/conf`,
				},
				validation: {
					isEnabled: true,
					classType: ValidConfWithWhitelistErrors,
					formatWhitelistErrors: false,
				},
			},
		});

		const output = await getLogsFromFile(file.path);

		t.true(output[3].includes('Checking configuration'), 'Should check configuration');

		t.true(
			output[4].includes('Configuration contains unexpected attributes'),
			'Should have whitelist errors',
		);
		t.true(output[4].includes('property qux should not exist'), 'Should have whitelist1 error');
		t.true(
			output[4].includes('property whitelist1 should not exist'),
			'Should have whitelist1 error',
		);
		t.true(
			output[4].includes('property whitelist2 should not exist'),
			'Should have whitelist2 error',
		);

		t.true(output[5].includes('Configuration is valid'), 'Should be a valid configuration');
		t.true(output[6].includes('Listening on port'), 'Should listen on port');

		// Close server
		await end(server, prometheusServer);
	},
);

ava('Should not show exclude properties on whitelist errors (formatted)', async (t: Assertions) => {
	process.env.NODE_ENV = 'development';
	const file = await tmp.file();
	const microPath = `${microConfValidation}/configuration-valid-with-additional-attributes`;

	const { server, prometheusServer } = await N9NodeRouting({
		path: microPath,
		logOptions: { developmentOutputFilePath: file.path },
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
	});

	const output = await getLogsFromFile(file.path);

	t.true(
		output.filter((line) => line.includes('secretPassword')).length === 0,
		'Should not show secretPassword in logs',
	);

	// Close server
	await end(server, prometheusServer);
});

ava('Secret should be usable in conf', async (t: Assertions) => {
	process.env.NODE_ENV = 'development';
	const file = await tmp.file();
	const microPath = `${microConfValidation}/configuration-valid-with-additional-attributes`;

	const { server, prometheusServer, conf } = await N9NodeRouting({
		path: microPath,
		logOptions: { developmentOutputFilePath: file.path },
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
	});

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

	// Close server
	await end(server, prometheusServer);
});

ava('Secret should not be exposed', async (t: Assertions) => {
	process.env.NODE_ENV = 'development';
	const file = await tmp.file();
	const microPath = `${microConfValidation}/configuration-valid-with-additional-attributes`;

	const { server, prometheusServer } = await N9NodeRouting({
		path: microPath,
		logOptions: { developmentOutputFilePath: file.path },
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
	});

	const exposedConf = await commons.jsonHttpClient.get<ValidConfWithWhitelistErrors>(
		'http://localhost:5000/conf',
	);

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

	// Close server
	await end(server, prometheusServer);
});

ava(
	'Should not show exclude properties on whitelist errors (not formatted)',
	async (t: Assertions) => {
		process.env.NODE_ENV = 'development';
		const file = await tmp.file();
		const microPath = `${microConfValidation}/configuration-valid-with-additional-attributes`;

		const { server, prometheusServer } = await N9NodeRouting({
			path: microPath,
			logOptions: { developmentOutputFilePath: file.path },
			conf: {
				n9NodeConf: {
					path: `${microPath}/conf`,
				},
				validation: {
					isEnabled: true,
					classType: ValidConfWithWhitelistErrors,
					formatWhitelistErrors: false,
				},
			},
		});

		const output = await getLogsFromFile(file.path);

		t.true(
			output.filter((line) => line.includes('secretPassword')).length === 0,
			'Should not show secretPassword in logs',
		);

		// Close server
		await end(server, prometheusServer);
	},
);

ava('Should not proceed any validation - no validation options given', async (t: Assertions) => {
	process.env.NODE_ENV = 'development';
	const file = await tmp.file();
	const microPath = `${microConfValidation}/configuration-invalid`;

	const { server, prometheusServer } = await N9NodeRouting({
		path: microPath,
		logOptions: { developmentOutputFilePath: file.path },
		conf: {
			n9NodeConf: {
				path: `${microPath}/conf`,
			},
		},
	});

	const output = await getLogsFromFile(file.path);

	t.true(
		output[3].includes('Configuration validation is disabled'),
		'Should not check configuration',
	);
	t.true(output[4].includes('Listening on port'), 'Should listen on port');

	// Close server
	await end(server, prometheusServer);
});

ava('Should not proceed any validation - validation is disabled', async (t: Assertions) => {
	process.env.NODE_ENV = 'development';
	const file = await tmp.file();
	const microPath = `${microConfValidation}/configuration-invalid`;

	const { server, prometheusServer } = await N9NodeRouting({
		path: microPath,
		logOptions: { developmentOutputFilePath: file.path },
		conf: {
			n9NodeConf: {
				path: `${microPath}/conf`,
			},
			validation: {
				isEnabled: false,
				classType: InvalidConf,
			},
		},
	});

	const output = await getLogsFromFile(file.path);

	t.true(
		output[3].includes('Configuration validation is disabled'),
		'Should not check configuration',
	);
	t.true(output[4].includes('Listening on port'), 'Should listen on port');

	// Close server
	await end(server, prometheusServer);
});

ava(
	'Should not proceed any validation - validation is disabled from the configuration extension',
	async (t: Assertions) => {
		process.env.NODE_ENV = 'development';
		const file = await tmp.file();
		const microPath = `${microConfValidation}/configuration-invalid`;

		const { server, prometheusServer } = await N9NodeRouting({
			path: microPath,
			logOptions: { developmentOutputFilePath: file.path },
			conf: {
				n9NodeConf: {
					path: `${microPath}/conf`,
					extendConfig: {
						path: {
							absolute: join(
								__dirname,
								'fixtures',
								'common-conf-validation',
								'configuration-invalid',
								'configuration-extension.json',
							),
						},
						key: 'apiName',
					},
				},
				validation: {
					isEnabled: true,
					classType: InvalidConf,
				},
			},
		});

		const output = await getLogsFromFile(file.path);

		t.true(
			output[3].includes('Configuration validation is disabled'),
			'Should not check configuration',
		);
		t.true(output[4].includes('Listening on port'), 'Should listen on port');

		// Close server
		await end(server, prometheusServer);
	},
);

ava(
	'Should not proceed any validation - validation is enabled but the class type of the' +
		' configuration is not set',
	async (t: Assertions) => {
		process.env.NODE_ENV = 'development';
		const microPath = `${microConfValidation}/configuration-valid`;

		const error: N9Error = await t.throwsAsync(
			N9NodeRouting({
				path: microPath,
				conf: {
					n9NodeConf: {
						path: `${microPath}/conf`,
					},
					validation: {
						isEnabled: true,
					},
				},
			}),
		);

		t.true(error.status === 500, 'Should throw a 500 error');
		t.true(
			error.message.includes('N9NodeRouting configuration validation options are not correct'),
			'Options are not correct',
		);
		t.true(
			error.message.includes('validation is enabled but no classType is given'),
			'No class type given',
		);
	},
);
