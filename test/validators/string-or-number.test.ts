import ava from 'ava';

import { IsStringOrNumber } from '../../src/validators/string-or-number.validator';

ava('Should be valid with a string', (t) => {
	const isStringOrNumber = new IsStringOrNumber();

	const value = 'string';
	t.true(isStringOrNumber.validate(value));
});

ava('Should be valid with a number', (t) => {
	const isStringOrNumber = new IsStringOrNumber();

	const value = 1;
	t.true(isStringOrNumber.validate(value));
});

ava('Should not be valid with other types', (t) => {
	const isStringOrNumber = new IsStringOrNumber();

	let value: any = true;
	t.false(isStringOrNumber.validate(value));

	value = {};
	t.false(isStringOrNumber.validate(value));
});
