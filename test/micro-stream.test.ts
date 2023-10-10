import { N9JSONStreamResponse } from '@neo9/n9-node-utils';
import ava, { ExecutionContext } from 'ava';

import { init, mockAndCatchStd, TestContext, urlPrefix } from './fixtures';

init('micro-stream');

ava('Basic stream', async (t: ExecutionContext<TestContext>) => {
	await mockAndCatchStd(async () => {
		const res = await t.context.httpClient.get<N9JSONStreamResponse<{ _id: string }>>([
			urlPrefix,
			'users',
		]);
		t.is(res.items.length, 4, 'check length');
		t.is(typeof res.metaData, 'object', 'metadata is object');
	});
});
