import { Body, JsonController, Post } from 'routing-controllers';
import { Service } from 'typedi';
import { Acl } from '../../../../src';

@Service()
@JsonController("/toto")
export class ValidateController {

	@Acl([{ action: 'createFoo', user: '@' }])
	@Post("/foo")
	public async createFoo(): Promise<void> {
		return;
	}
}
