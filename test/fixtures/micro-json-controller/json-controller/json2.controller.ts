import { Acl, JsonController, Post, Service } from '../../../../src';

@Service()
@JsonController('/tata')
export class ValidateController {
	@Acl([{ action: 'createBar', user: '@' }])
	@Post()
	public async createBar(): Promise<void> {
		return;
	}
}
