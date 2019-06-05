import test, { Assertions } from 'ava';
import N9NodeRouting from '../src';
import { ApplicationModule } from './fixtures/index/app.module';

test('Error to json', async (t: Assertions) => {
	await N9NodeRouting(ApplicationModule);

	const text = 'message-error-text';
	const e = Error(text);
	const eAsJSON = JSON.stringify(e);

	t.is(eAsJSON, JSON.stringify({ name: 'Error', message: text}));
});
