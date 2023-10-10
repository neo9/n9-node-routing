import ava, { ExecutionContext } from 'ava';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as QueryString from 'query-string';

import { init, TestContext, urlPrefix } from './fixtures';
import { FilterQuery } from './fixtures/micro-query-params/models/filter-query.models';

init('micro-query-params');

ava('GET /test/ => 200 with good params', async (t: ExecutionContext<TestContext>) => {
	const queryParams: FilterQuery = {
		pmString: ['a', 'b'],
		pmNumber: [1, 2],
		pmDate: [
			new Date(),
			new Date('2025-03-29T15:31:15.512Z').toISOString() as any,
			new Date(2001, 0, 31),
		],
		pmBoolean: [true, false],
		pString: ['a', 'b'],
		pNumber: [1],
		pDate: [new Date('2021-03-29T15:31:15.512Z')],
		pBoolean: [true],
		pObject: { a: 1, s: 'string' },
		q: 'azerty',
	};

	for (const arrayFormat of ['bracket', 'index', 'none'] as ('bracket' | 'index' | 'none')[]) {
		const sentQueryParams = _.cloneDeep(queryParams);
		sentQueryParams.pObject = JSON.stringify(sentQueryParams.pObject) as any;

		const queryString = QueryString.stringify(sentQueryParams, { arrayFormat: 'none' });
		const filterQuery = await t.context.httpClient.get<FilterQuery>([
			urlPrefix,
			`test?${queryString}`,
		]);

		const expectedObject = _.cloneDeep(queryParams);
		// transform Date as ISOString because date as JSON are in string
		expectedObject.pmDate = expectedObject.pmDate?.map((d) =>
			d instanceof Date ? (moment(d).startOf('s').toISOString() as any) : d,
		);
		// by default query-string transform date to `Mon Mar 29 2021 17:31:15 GMT+0200 (Central European Summer Time)` so it loose ms
		expectedObject.pDate = expectedObject.pDate?.map(
			(d) => moment(d).startOf('s').toISOString() as any,
		);
		t.deepEqual(
			filterQuery,
			expectedObject,
			`Params sent are well parsed for arrayFormat : ${arrayFormat}`,
		);
	}
});
