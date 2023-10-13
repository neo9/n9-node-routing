import test, { ExecutionContext } from 'ava';

import { init, mockAndCatchStd, TestContext, urlPrefix } from './fixtures';

init('micro-json-controller');

test('Acl usage with JSON Controller, check /routes', async (t: ExecutionContext<TestContext>) => {
	await mockAndCatchStd(async () => {
		// Check acl on routes
		await t.context.httpClient.get([urlPrefix, 'routes']);
		const res = await t.context.httpClient.get<any[]>([urlPrefix, 'routes']);

		t.is(res.length, 3);

		const routesToCall = [];
		const route1 = res[0];
		t.is(route1.description, undefined);
		t.is(route1.method, 'post');
		t.is(route1.path, '/toto/foo');
		t.is(route1.acl.perms[0].action, 'createFoo');
		routesToCall.push(route1.path);

		const route2 = res[1];
		t.is(route2.description, undefined);
		t.is(route2.method, 'post');
		t.is(route2.path, '/tata');
		t.is(route2.acl.perms[0].action, 'createBar');
		routesToCall.push(route2.path);

		const route3 = res[2];
		t.is(route3.description, undefined);
		t.is(route3.method, 'post');
		t.is(route3.path, '/no-controller');
		t.is(route3.acl.perms[0].action, 'createFoo');
		routesToCall.push(route3.path);

		for (const routeToCall of routesToCall) {
			await t.notThrowsAsync(
				async () => await t.context.httpClient.post([urlPrefix, routeToCall]),
				`call ${routeToCall}`,
			);
		}
	});
});
