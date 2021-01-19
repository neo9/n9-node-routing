import { Get, HeaderParam, JsonController } from 'routing-controllers';
import { Service } from 'typedi';

@Service()
@JsonController()
export class ErrorsController {
	@Get('/requires-header')
	public async getError500(@HeaderParam('test', { required: true }) p: string): Promise<any> {
		return { ok: true };
	}
}
