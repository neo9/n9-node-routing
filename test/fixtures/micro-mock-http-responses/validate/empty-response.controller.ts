import { Get, JsonController, QueryParam } from '@flyacts/routing-controllers';
import { Service } from 'typedi';

@Service()
@JsonController()
export class ErrorsController {
	@Get('/empty-response')
	public async emptyResponse(): Promise<any> {
		return;
	}
}
