import { N9JSONStream } from '@neo9/n9-node-utils';
import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import streamArray = require('stream-array');


@Controller()
export class UsersController {

	@Get('/users')
	public async stream(@Res() res: Response): Promise<any> {
		const items = [{ _id: 'a' }, { _id: 'b' }, { _id: 'c' }, { _id: 'd' }];

		streamArray(items)
				.pipe(new N9JSONStream({
					total: 5,
					metaData: {
						lastUpdate: new Date()
					}
				}))
				.pipe(res);
	}
}
