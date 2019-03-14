import test, { Assertions } from 'ava';
import routingControllerWrapper from '../src';

test('Basic stream', async (t: Assertions) => {
	await routingControllerWrapper({ http: { port: 6666 } });

	const text = 'message-error-text';
	const e = Error(text);
	const eAsJSON = JSON.stringify(e);

	t.is(eAsJSON, JSON.stringify({ name: 'Error', message: text}));
});
