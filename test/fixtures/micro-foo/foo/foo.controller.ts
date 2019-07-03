import { Body, Controller, Get, Post } from '@nestjs/common';
import { Acl } from '../../../../src';

@Controller()
export class FooController {

	@Post(["/foo", "/v1/fou"])
	public async createFoo(@Body() body: any): Promise<any> {
		return body;
	}

	@Acl([{ action: 'readFoo', user: '@' }])
	@Get('/foo')
	public async getFoo(): Promise<object> {
		return {
			foo: 'bar'
		};
	}
}
