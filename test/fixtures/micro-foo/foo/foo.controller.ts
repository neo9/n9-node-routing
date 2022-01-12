import { Acl, Body, Get, JsonController, Post, Service } from '../../../../src';

@Service()
@JsonController()
export class ValidateController {
	@Post('/foo')
	@Post('/v1/fou')
	public createFoo(@Body() body: any): any {
		return body;
	}

	@Acl([{ action: 'readFoo', user: '@' }])
	@Get('/foo')
	public getFoo(): object {
		return {
			foo: 'bar',
		};
	}
}
