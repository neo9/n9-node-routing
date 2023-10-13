import { N9Log } from '@neo9/n9-node-log';

import { Get, Inject, JsonController, Service } from '../../../../src';

@Service()
@JsonController()
export class ValidateController {
	constructor(
		private readonly logger: N9Log,
		@Inject('conf') private readonly conf: any,
	) {}

	@Get('/bar')
	public getBar(): any {
		this.logger.info('message in controller');
		return this.conf;
	}

	@Get('/empty')
	public getBar2(): void {
		return;
	}
}
