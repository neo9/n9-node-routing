import { Controller, Post } from '@nestjs/common';
import { Acl } from '../../../../src';

@Controller()
export class NoJsonController {

	@Acl([{ action: 'createFoo', user: '@' }])
	@Post("/no-controller")
	public async createFoo(): Promise<void> {
		return;
	}
}
