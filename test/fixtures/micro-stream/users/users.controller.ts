import { N9JSONStream } from '@neo9/n9-node-utils';
import { Response } from 'express';
import streamArray = require('stream-array');
import { Get, JsonController, Res, Service } from '../../../../src';

@Service()
@JsonController()
export class UsersController {
	@Get('/users')
	public async stream(@Res() res: Response): Promise<any> {
		const items = [{ _id: 'a' }, { _id: 'b' }, { _id: 'c' }, { _id: 'd' }];

		return streamArray(items).pipe(
			new N9JSONStream({
				total: 5,
				metaData: {
					lastUpdate: new Date(),
				},
			}),
		);
	}
}
