import { N9JSONStream } from '@neo9/n9-node-utils';

import streamArray = require('stream-array');
import { Get, JsonController, Service } from '../../../../src';

@Service()
@JsonController()
export class UsersController {
	@Get('/users')
	public stream(): any {
		const items = [{ _id: 'a' }, { _id: 'b' }, { _id: 'c' }, { _id: 'd' }];

		return streamArray(items).pipe(
			new N9JSONStream<{ _id: string }, { lastUpdate: Date }>({
				total: 5,
				metaData: {
					lastUpdate: new Date(),
				},
			}),
		);
	}
}
