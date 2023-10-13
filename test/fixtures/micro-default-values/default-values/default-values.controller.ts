import {
	Body,
	HeaderParams,
	JsonController,
	N9Log,
	Post,
	QueryParams,
	Service,
} from '../../../../src';
import { BodyModel } from './body.model';
import { HeadersModel } from './headers.model';
import { QueryParamsModel } from './query-params.model';

@Service()
@JsonController()
export class DefaultValuesController {
	constructor(private readonly logger: N9Log) {}

	@Post('/default-values')
	public do(
		@Body() body: BodyModel,
		@QueryParams() queryParams: QueryParamsModel,
		@HeaderParams() headers: HeadersModel,
	): any {
		this.logger.info(`Received values are :`);
		this.logger.info(`body : ${JSON.stringify(body, null, 2)}`);
		this.logger.info(`queryParams : ${JSON.stringify(queryParams, null, 2)}`);
		this.logger.info(`headers : ${JSON.stringify(headers, null, 2)}`);
		return {
			queryParams,
			body,
			headers,
		};
	}
}
