import { N9Error, waitFor } from '@neo9/n9-node-utils';
import test, { Assertions } from 'ava';
import { getFromContainer, MetadataStorage, registerSchema, validateOrReject, ValidationSchema } from 'class-validator';
import { ValidationMetadata } from 'class-validator/metadata/ValidationMetadata';
import * as stdMock from 'std-mocks';
import commons from './fixtures/commons';

const userValidationSchemas: ValidationSchema[] = [{
	name: '',
	properties: {
		firstName: [{
			type: 'minLength',
			constraints: [3],
		}, {
			type: 'maxLength',
			constraints: [20],
		}],
		lastName: [{
			type: 'minLength',
			constraints: [2],
		}, {
			type: 'maxLength',
			constraints: [20],
		}],
		email: [{
			type: 'isEmail',
			constraints: [],
		}],
	},
}, {
	name: '',
	properties: {
		email: [],
	},
}, {
	name: '',
	properties: {
		firstName: [{
			type: 'isBoolean',
			constraints: [],
		}],
	},
}];

async function testValidation(index: number): Promise<void> {
	const user = { firstName: 'Johny', lastName: 'Cage', email: 'johny@cage.com' };
	const expectedErrorsFromIndex: boolean[] = [false, false, true];
	const expectErrors = expectedErrorsFromIndex[index];
	const schemaName = 'myUserSchema-' + new Date().getTime() + Math.random();

	const schema = JSON.parse(JSON.stringify(userValidationSchemas[index])); // Clone deep
	schema.name = schemaName;
	registerSchema(schema);

	await waitFor(100);

	try {
		await validateOrReject(schemaName, user);
		// istanbul ignore next
		if (expectErrors) throw new N9Error('Errors are expected for index : ' + index, 400, { schemaName, schema, index });
	} catch (errors) {
		// istanbul ignore next
		if (!Array.isArray(errors)) throw errors;

		// istanbul ignore next
		if (!expectErrors) {
			throw new N9Error('No error expected for index : ' + index, 400, { errors, index });
		}
	} finally {
		const classValidatorStorage = getFromContainer(MetadataStorage);
		classValidatorStorage['validationMetadatas'] = classValidatorStorage['validationMetadatas'].filter((metaData: ValidationMetadata) => metaData.target !== schemaName);
	}
}

test('[VALIDATE-PARALLEL] Check validation with multiple schemas', async (t: Assertions) => {
	stdMock.use({ print: commons.print });

	// Serial exec
	for (let i = 0; i < userValidationSchemas.length; i++) {
		await t.notThrows(async () => await testValidation(i), 'Validation ok for index : ' + i);
	}

	// Parallel exec
	await t.notThrows(async () => await Promise.all(userValidationSchemas.map(async (v, i) => await testValidation(i))), 'Validation parallel is OK');

	stdMock.restore();
	stdMock.flush();
});
