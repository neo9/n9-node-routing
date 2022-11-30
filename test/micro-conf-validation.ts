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
	t.true(errors.context.validationErrors[0].constraints.isNumber.includes('bar must be a number'));
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

	t.true(errors.message === 'Configuration is not valid');
	t.true(errors.context.validationErrors[0].constraints.isNumber.includes('bar must be a number'));
});

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
	t.true(output[3].includes("Please remove attribute 'env'"));
	t.true(output[4].includes("Please remove attribute 'name'"));
	t.true(output[5].includes("Please remove attribute 'version'"));
	t.true(output[6].includes('Configuration is valid'));
	t.true(output[7].includes('Listening on port'));

	await closeServer(server);
});

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
