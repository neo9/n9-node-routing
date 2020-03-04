import { Get, JsonController, QueryParam } from '@flyacts/routing-controllers';
import { Service } from 'typedi';

@Service()
@JsonController()
export class ErrorsController {
	@Get('/by-multiple-ids')
	public async byMultipleIds(
		@QueryParam('ids', { validate: false, type: String }) idsParam: string[] | string = [],
	): Promise<any> {
		const ids: string[] = Array.isArray(idsParam) ? idsParam : [idsParam] || [];
		return { ids };
	}
}
