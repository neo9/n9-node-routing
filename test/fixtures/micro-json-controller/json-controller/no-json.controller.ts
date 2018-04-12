import { JsonController, Post } from 'routing-controllers';
import { Service } from 'typedi';
import { Acl } from '../../../../src';

@Service()
@JsonController()
export class ValidateController {

	@Acl([{ action: 'createFoo', user: '@' }])
	@Post("/no-controller")
	public async createFoo(): Promise<void> {
		return;
	}
}
