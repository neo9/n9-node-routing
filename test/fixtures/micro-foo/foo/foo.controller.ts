import { Body, Controller, Get, Post } from '@nestjs/common';
import { Acl } from '../../../../src';

@Controller()
export class FooController {

	@Post("/foo")
	// @Post(["/foo", "/v1/fou"]) : Syntax not supported by nestJS & swagger
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
