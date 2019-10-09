import test, { Assertions } from 'ava';
import * as stdMock from 'std-mocks';
import N9NodeRouting from '../src';
import commons from './fixtures/commons';

const print = commons.print;

test('Error to json', async (t: Assertions) => {
	stdMock.use({ print });
	await N9NodeRouting();

	const text = 'message-error-text';
	const e = Error(text);
	const eAsJSON = JSON.stringify(e);

	const expectedStart = JSON.stringify({ name: 'Error', message: text, stack: 'Error: message-error-text' }).substring(0, -2);
	t.true(eAsJSON.startsWith(expectedStart), ` \n${eAsJSON} \n ${expectedStart}`);
});
