import { Body, Get, JsonController, Post } from 'routing-controllers';
import { Service } from 'typedi';
import { Acl } from '../../../../src';

@Service()
@JsonController()
export class ValidateController {

	@Get("/bar")
	public async getBar(): Promise<void> {
		(global as any).log.info(' message in controller');
		return;
	}
}
