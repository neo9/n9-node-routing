import { Get, JsonController, QueryParam, Service } from '../../../../src';

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
