import { Body, Get, JsonController, Post } from '@flyacts/routing-controllers';
import { Service } from 'typedi';
import { Acl } from '../../../../src/decorators/acl.decorator';

@Service()
@JsonController()
export class ValidateController {
	@Post('/foo')
	@Post('/v1/fou')
	public async createFoo(@Body() body: any): Promise<any> {
		return body;
	}

	@Acl([{ action: 'readFoo', user: '@' }])
	@Get('/foo')
	public async getFoo(): Promise<object> {
		return {
			foo: 'bar',
		};
	}
}
