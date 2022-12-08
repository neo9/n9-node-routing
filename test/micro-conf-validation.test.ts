import { N9Error } from '@neo9/n9-node-utils';
import ava, { Assertions } from 'ava';
import { join } from 'path';
import * as tmp from 'tmp-promise';

import N9NodeRouting from '../src';
import { Conf as InvalidConf } from './fixtures/common-conf-validation/configuration-invalid/conf/index.models';
import { Conf as ValidConf } from './fixtures/common-conf-validation/configuration-valid/conf/index.models';
import { Conf as ValidConfWithWhitelistErrors } from './fixtures/common-conf-validation/configuration-valid-with-additional-attributes/conf/index.models';
import { closeServer } from './fixtures/commons';
import { getLogsFromFile } from './fixtures/helper';

const microConfValidation = join(__dirname, 'fixtures/common-conf-validation/');

ava.beforeEach(() => {
	delete (global as any).log;
	delete (global as any).conf;
});

ava('Should be a valid configuration', async (t: Assertions) => {
	process.env.NODE_ENV = 'development';
	const file = await tmp.file();
	const microPath = `${microConfValidation}/configuration-valid`;

	const { server } = await N9NodeRouting({
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

	t.true(output[1].includes('Checking configuration'), 'Should check configuration');
	t.true(output[2].includes('Configuration is valid'), 'Should be a valid configuration');
	t.true(output[3].includes('Listening on port'), 'Should listen on port');
	t.true(output.length === 5, 'Should have 5 lines of logs');

	await closeServer(server);
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

	t.true(output[0].includes('Conf loaded: development'), 'Should load conf');
	t.true(output[1].includes('Checking configuration'), 'Should check configuration');
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

	t.true(output[0].includes('Conf loaded: development'), 'Should load conf');
	t.true(output[1].includes('Checking configuration'), 'Should check configuration');
	t.true(output[2].includes('Configuration is not valid:'), 'Should not be a valid configuration');
	t.true(output[3].includes('Attribute bar is not valid - isIn'), 'Should have isIn error');
	t.true(output[4].includes('Attribute bar is not valid - isNumber'), 'Should have isNumber error');
	t.true(
		output[5].includes('Attribute baz.qux is not valid - isString'),
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

ava('Should be a valid configuration with whitelist errors (formatted)', async (t: Assertions) => {
	process.env.NODE_ENV = 'development';
	const file = await tmp.file();
	const microPath = `${microConfValidation}/configuration-valid-with-additional-attributes`;

	const { server } = await N9NodeRouting({
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

	t.true(output[1].includes('Checking configuration'), 'Should check configuration');
	t.true(
		output[2].includes('Configuration contains unexpected attributes'),
		'Should have whitelist errors',
	);
	t.true(
		output[3].includes("Please remove attribute 'whitelist1'"),
		'Should have whitelist1 error',
	);
	t.true(
		output[4].includes("Please remove attribute 'whitelist2'"),
		'Should have whitelist2 error',
	);
	t.true(output[5].includes("Please remove attribute 'baz.qux'"), 'Should have baz.qux error');
	t.true(output[6].includes('Configuration is valid'), 'Should be a valid configuration');
	t.true(output[7].includes('Listening on port'), 'Should listen on port');

	await closeServer(server);
});

ava(
	'Should be a valid configuration with whitelist errors (not formatted)',
	async (t: Assertions) => {
		process.env.NODE_ENV = 'development';
		const file = await tmp.file();
		const microPath = `${microConfValidation}/configuration-valid-with-additional-attributes`;

		const { server } = await N9NodeRouting({
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

		t.true(output[1].includes('Checking configuration'), 'Should check configuration');

		t.true(
			output[2].includes('Configuration contains unexpected attributes'),
			'Should have whitelist errors',
		);
		t.true(output[2].includes('property qux should not exist'), 'Should have whitelist1 error');
		t.true(
			output[2].includes('property whitelist1 should not exist'),
			'Should have whitelist1 error',
		);
		t.true(
			output[2].includes('property whitelist2 should not exist'),
			'Should have whitelist2 error',
		);

		t.true(output[3].includes('Configuration is valid'), 'Should be a valid configuration');
		t.true(output[4].includes('Listening on port'), 'Should listen on port');

		await closeServer(server);
	},
);

ava('Should not show exclude properties on whitelist errors (formatted)', async (t: Assertions) => {
	process.env.NODE_ENV = 'development';
	const file = await tmp.file();
	const microPath = `${microConfValidation}/configuration-valid-with-additional-attributes`;

	const { server } = await N9NodeRouting({
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

	await closeServer(server);
});

ava(
	'Should not show exclude properties on whitelist errors (not formatted)',
	async (t: Assertions) => {
		process.env.NODE_ENV = 'development';
		const file = await tmp.file();
		const microPath = `${microConfValidation}/configuration-valid-with-additional-attributes`;

		const { server } = await N9NodeRouting({
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

		await closeServer(server);
	},
);

ava('Should not proceed any validation - no validation options given', async (t: Assertions) => {
	process.env.NODE_ENV = 'development';
	const file = await tmp.file();
	const microPath = `${microConfValidation}/configuration-invalid`;

	const { server } = await N9NodeRouting({
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
		output[1].includes('Configuration validation is disabled'),
		'Should not check configuration',
	);
	t.true(output[2].includes('Listening on port'), 'Should listen on port');

	await closeServer(server);
});

ava('Should not proceed any validation - validation is disabled', async (t: Assertions) => {
	process.env.NODE_ENV = 'development';
	const file = await tmp.file();
	const microPath = `${microConfValidation}/configuration-invalid`;

	const { server } = await N9NodeRouting({
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
		output[1].includes('Configuration validation is disabled'),
		'Should not check configuration',
	);
	t.true(output[2].includes('Listening on port'), 'Should listen on port');

	await closeServer(server);
});

ava(
	'Should not proceed any validation - validation is disabled from the configuration extension',
	async (t: Assertions) => {
		process.env.NODE_ENV = 'development';
		const file = await tmp.file();
		const microPath = `${microConfValidation}/configuration-invalid`;

		const { server } = await N9NodeRouting({
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
			output[1].includes('Configuration validation is disabled'),
			'Should not check configuration',
		);
		t.true(output[2].includes('Listening on port'), 'Should listen on port');

		await closeServer(server);
	},
);

ava(
	'Should not proceed any validation - validation is enabled but the class type of the' +
		' configuration is not set',
	async (t: Assertions) => {
		process.env.NODE_ENV = 'development';
		const microPath = `${microConfValidation}/configuration-valid`;

		const errors: N9Error = await t.throwsAsync(
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

		t.true(errors.status === 500, 'Should throw a 500 error');
		t.true(
			errors.message.includes('N9NodeRouting configuration validation options are not correct'),
			'Options are not correct',
		);
		t.true(
			errors.message.includes('validation is enabled but no classType is given'),
			'No class type given',
		);
	},
);
