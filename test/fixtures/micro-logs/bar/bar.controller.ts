import { N9Log } from '@neo9/n9-node-log';
import { Get, Inject, JsonController, Service } from '../../../../src';

@Service()
@JsonController()
export class ValidateController {
	@Inject('logger')
	private logger: N9Log;

	@Inject('conf')
	private conf: any;

	@Get('/bar')
	public async getBar(): Promise<any> {
		this.logger.info(' message in controller');
		return this.conf;
	}

	@Get('/empty')
	public async getBar2(): Promise<void> {
		return;
	}
}
