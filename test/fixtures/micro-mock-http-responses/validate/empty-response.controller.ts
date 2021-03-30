import { Get, JsonController, Service } from '../../../../src';

@Service()
@JsonController()
export class ErrorsController {
	@Get('/empty-response')
	public async emptyResponse(): Promise<any> {
		return;
	}
}
