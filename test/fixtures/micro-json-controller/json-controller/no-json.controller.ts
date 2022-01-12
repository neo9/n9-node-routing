import { Acl, JsonController, Post, Service } from '../../../../src';

@Service()
@JsonController()
export class ValidateController {
	@Acl([{ action: 'createFoo', user: '@' }])
	@Post('/no-controller')
	public createFoo(): void {
		return;
	}
}
