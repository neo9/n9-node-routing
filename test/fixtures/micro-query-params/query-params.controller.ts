import { Get, JsonController, QueryParams, Service } from '../../../src';
import { FilterQuery } from './models/filter-query.models';

@Service()
@JsonController('/test')
export class QueryParamsController {
	@Get('/')
	public getUserById(@QueryParams() o: FilterQuery): FilterQuery {
		return o;
	}
}
