import { N9Error } from '@neo9/n9-node-utils';

import { Get, JsonController, Service } from '../../../../src';

@Service()
@JsonController()
export class ErrorsController {
	@Get('/numeric-error-code')
	public numericResponseCode(): any {
		throw new N9Error(500 as any);
	}
}
