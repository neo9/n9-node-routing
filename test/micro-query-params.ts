// tslint:disable:ordered-imports
import { end, init, get, logErrorForHuman } from './fixtures/helper';
import ava, { ExecutionContext } from 'ava';
import * as QueryString from 'query-string';
import { FilterQuery } from './fixtures/micro-query-params/models/filter-query.models';

const context: any = {};

/*
 ** Start API
 */
ava.before('Start API', async () => {
	const { server } = await init('micro-query-params', true);
	context.server = server;
});

ava('GET /test/ => 200 with good params', async (t: ExecutionContext) => {
	const queryParams: FilterQuery = {
		pmString: ['a', 'b'],
		pmNumber: [1, 2],
		pmDate: [new Date(), new Date(2001, 0, 31)],
		pmBoolean: [true, false],
		pmObject: [
			{ a: 1, s: 'string' },
			{ a: 2, s: 'string2' },
		],
		pString: ['a', 'b'],
		pNumber: [1],
		pDate: [new Date()],
		pBoolean: [true],
		pObject: [{ a: 1, s: 'string' }],
		q: 'azerty',
	};
	for (const arrayFormat of ['bracket', 'index', 'none'] as ('bracket' | 'index' | 'none')[]) {
		const queryString = QueryString.stringify(queryParams, { arrayFormat });
		// console.log(`-- micro-query-params.ts queryString --`, queryString);
		const { body, err } = await get<any>(`/test/?${queryString}`, 'json');
		if (err) {
			logErrorForHuman(err);
		}
		t.falsy(err?.context, `Error context is empty for arrayFormat : ${arrayFormat}`);
		t.falsy(err, `Error is empty for arrayFormat : ${arrayFormat}`);
		t.deepEqual(body, queryParams, `Params sent are well parsed for arrayFormat : ${arrayFormat}`);
	}
});

/*
 ** Stop API
 */
ava.after('Stop server', async () => {
	await end(context.server);
});
