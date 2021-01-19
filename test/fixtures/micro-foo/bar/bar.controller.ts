import { N9Error } from '@neo9/n9-node-utils';
import { Body, Get, JsonController, Param, Post, QueryParam } from 'routing-controllers';
import { Service } from 'typedi';
import { BodyBar } from './body-bar.models';

@Service()
@JsonController()
export class ValidateController {
	@Post('/:version/bar')
	public async bar(
		@Param('version') version: string,
		@QueryParam('error') queryError: boolean,
		@Body() body: BodyBar,
	): Promise<any> {
		if (queryError) {
			if (version === 'v1') {
				throw new N9Error('bar-error');
			}
			throw new N9Error('bar-extendable-error', 505, {
				test: true,
				error: new Error('sample-error'),
			});
		}
		return { bar: 'foo' };
	}

	@Get('/bar-fail')
	public async barFail(): Promise<any> {
		throw new Error();
	}
}
