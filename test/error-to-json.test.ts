import test, { ExecutionContext } from 'ava';

import { init, mockAndCatchStd, TestContext } from './fixtures';

init();

test('Error to json', async (t: ExecutionContext<TestContext>) => {
	await mockAndCatchStd(() => {
		const text = 'message-error-text';
		const e = Error(text);
		const eAsJSON = JSON.stringify(e);

		const expectedStart = JSON.stringify({
			name: 'Error',
			message: text,
			stack: 'Error: message-error-text',
		}).substring(0, -2);
		t.true(eAsJSON.startsWith(expectedStart), ` \n${eAsJSON} \n ${expectedStart}`);
	});
});
