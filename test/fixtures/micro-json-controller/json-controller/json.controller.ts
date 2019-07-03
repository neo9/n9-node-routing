import { Controller, Post } from '@nestjs/common';
import { Acl } from '../../../../src';

@Controller("/toto")
export class JsonController {

	@Acl([{ action: 'createFoo', user: '@' }])
	@Post("/foo")
	public async createFoo(): Promise<void> {
		return;
	}
}
