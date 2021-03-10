import { Get, JsonController, QueryParams } from 'routing-controllers';
import { Service } from 'typedi';
import { FilterQuery } from './models/filter-query.models';

@Service()
@JsonController('/test')
export class QueryParamsController {
	@Get('/')
	public async getUserById(@QueryParams() o: FilterQuery): Promise<FilterQuery> {
		return o;
	}
}
