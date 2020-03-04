import { Get, HeaderParam, JsonController } from '@flyacts/routing-controllers';
import { N9Log } from '@neo9/n9-node-log';
import { Inject, Service } from 'typedi';

@Service()
@JsonController()
export class ErrorsController {
	@Inject('logger')
	private logger: N9Log;
	@Get('/requires-header')
	public async getError500(@HeaderParam('test', { required: true }) p: string): Promise<any> {
		return { ok: true };
	}
}
