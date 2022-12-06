import { N9Error } from '@neo9/n9-node-utils';
import ava, { Assertions } from 'ava';
import { join } from 'path';
import * as tmp from 'tmp-promise';

import N9NodeRouting from '../src';
import { closeServer } from './fixtures/commons';
import { getLogsFromFile } from './fixtures/helper';
import { Conf as InvalidConf } from './fixtures/micro-conf-validation/configuration-invalid/conf/index.models';
import { Conf as ValidConf } from './fixtures/micro-conf-validation/configuration-valid/conf/index.models';
import { Conf as ValidConfWithWhitelistErrors } from './fixtures/micro-conf-validation/configuration-valid-with-additional-attributes/conf/index.models';

const microConfValidation = join(__dirname, 'fixtures/micro-conf-validation/');

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

	t.true(output[1].includes('Checking configuration'));
	t.true(output[2].includes('Configuration is valid'));
	t.true(output[3].includes('Listening on port'));
	t.true(output.length === 5);

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

	t.true(output[0].includes('Conf loaded: development'));
	t.true(output[1].includes('Checking configuration'));
	t.true(errors.message === 'Configuration is not valid');

	const validationErrors = errors.context.validationErrors;
	t.true(validationErrors.length === 2);

	const barError = validationErrors[0];
	t.true(barError.property === 'bar');
	t.true(
		barError.constraints.isNumber ===
			'bar must be a number conforming to the specified constraints',
	);
	t.true(barError.constraints.isIn === 'bar must be one of the following values: 1, 2');

	const bazError = validationErrors[1];
	t.true(bazError.property === 'baz');
	t.true(bazError.children.length === 1);

	const quxError = bazError.children[0];
	t.true(quxError.property === 'qux');
	t.true(quxError.constraints.isString === 'qux must be a string');
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

	t.true(output[0].includes('Conf loaded: development'));
	t.true(output[1].includes('Checking configuration'));
	t.true(output[2].includes('Configuration is not valid:'));
	t.true(output[3].includes('Attribute bar is not valid - isIn'));
	t.true(output[4].includes('Attribute bar is not valid - isNumber'));
	t.true(output[5].includes('Attribute baz.qux is not valid - isString'));

	t.true(errors.message === 'Configuration is not valid');
	t.true(errors.context.validationErrors[0].constraints.isNumber.includes('bar must be a number'));
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

		t.true(output.filter((line) => line.includes('secretPassword')).length === 0);

		t.true(!errors.message.includes('secretPassword'));
		t.true(!JSON.stringify(errors.context).includes('secretPassword'));
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

		t.true(output.filter((line) => line.includes('secretPassword')).length === 0);

		t.true(!errors.message.includes('secretPassword'));
		t.true(!JSON.stringify(errors.context).includes('secretPassword'));
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

	t.true(output[1].includes('Checking configuration'));
	t.true(output[2].includes('Configuration contains unexpected attributes'));
	t.true(output[3].includes("Please remove attribute 'whitelist1'"));
	t.true(output[4].includes("Please remove attribute 'whitelist2'"));
	t.true(output[5].includes("Please remove attribute 'baz.qux'"));
	t.true(output[6].includes('Configuration is valid'));
	t.true(output[7].includes('Listening on port'));

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

		t.true(output[1].includes('Checking configuration'));

		t.true(output[2].includes('Configuration contains unexpected attributes'));
		t.true(output[2].includes('property qux should not exist'));
		t.true(output[2].includes('property whitelist1 should not exist'));
		t.true(output[2].includes('property whitelist2 should not exist'));

		t.true(output[3].includes('Configuration is valid'));
		t.true(output[4].includes('Listening on port'));

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

	t.true(output.filter((line) => line.includes('secretPassword')).length === 0);

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

		t.true(output.filter((line) => line.includes('secretPassword')).length === 0);

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

	t.true(output[1].includes('Configuration validation is disabled'));
	t.true(output[2].includes('Listening on port'));

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

	t.true(output[1].includes('Configuration validation is disabled'));
	t.true(output[2].includes('Listening on port'));

	await closeServer(server);
});

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

		t.true(errors.status === 500);
		t.true(
			errors.message.includes('N9NodeRouting configuration validation options are not correct'),
		);
		t.true(errors.message.includes('validation is enabled but no classType is given'));
	},
);
