import { N9Log } from '@neo9/n9-node-log';
import { N9Error } from '@neo9/n9-node-utils';

import { Get, Inject, JsonController, Service } from '../../../../src';

@Service()
@JsonController()
export class ErrorsController {
	@Inject('logger')
	private logger: N9Log;
	@Get('/503')
	public getError500(): any {
		this.logger.error(`An error occurred, client should retry`);
		throw new N9Error('an-error', 503);
	}
}
