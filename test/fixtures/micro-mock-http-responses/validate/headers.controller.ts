import { Get, HeaderParam, JsonController, Service } from '../../../../src';

@Service()
@JsonController()
export class ErrorsController {
	@Get('/requires-header')
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public getError500(@HeaderParam('test', { required: true }) p: string): any {
		return { ok: true };
	}
}
