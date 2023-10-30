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
		const routeNoController = res[0];
		t.is(routeNoController.description, undefined);
		t.is(routeNoController.method, 'post');
		t.is(routeNoController.path, '/no-controller');
		t.is(routeNoController.acl.perms[0].action, 'createFoo');
		routesToCall.push(routeNoController.path);

		const routeTata = res[1];
		t.is(routeTata.description, undefined);
		t.is(routeTata.method, 'post');
		t.is(routeTata.path, '/tata');
		t.is(routeTata.acl.perms[0].action, 'createBar');
		routesToCall.push(routeTata.path);

		const routeTotoFoo = res[2];
		t.is(routeTotoFoo.description, undefined);
		t.is(routeTotoFoo.method, 'post');
		t.is(routeTotoFoo.path, '/toto/foo');
		t.is(routeTotoFoo.acl.perms[0].action, 'createFoo');
		routesToCall.push(routeTotoFoo.path);

		for (const routeToCall of routesToCall) {
			await t.notThrowsAsync(
				async () => await t.context.httpClient.post([urlPrefix, routeToCall]),
				`call ${routeToCall}`,
			);
		}
	});
});
