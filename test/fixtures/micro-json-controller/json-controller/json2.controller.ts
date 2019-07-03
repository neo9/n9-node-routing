import { Acl } from '../../../../src';
import { Controller, Post } from '@nestjs/common';

@Controller("/tata")
export class Json2Controller {

	@Acl([{ action: 'createBar', user: '@' }])
	@Post()
	public async createBar(): Promise<void> {
		return;
	}
}
