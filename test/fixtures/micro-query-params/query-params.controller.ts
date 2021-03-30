import { Get, JsonController, QueryParams, Service } from '../../../src';
import { FilterQuery } from './models/filter-query.models';

@Service()
@JsonController('/test')
export class QueryParamsController {
	@Get('/')
	public async getUserById(@QueryParams() o: FilterQuery): Promise<FilterQuery> {
		return o;
	}
}
