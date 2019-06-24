import { N9Error } from '@neo9/n9-node-utils';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { BodyBar } from './body-bar.models';

@Controller()
export class BarController {

	@Post("/:version/bar")
	public async bar(@Param("version") version: string, @Query('error') queryError: boolean, @Body() body: BodyBar): Promise<any> {
		if (queryError) {
			if (version === 'v1') {
				throw new N9Error('bar-error');
			}
			throw new N9Error('bar-extendable-error', 505, { test: true });
		}
		return { bar: 'foo' };
	}

	@Get('/bar-fail')
	public async barFail(): Promise<any> {
		throw new Error();
	}
}
