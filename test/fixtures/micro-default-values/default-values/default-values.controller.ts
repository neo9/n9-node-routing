import { QueryParams } from '@benjd90/routing-controllers';
import { N9Log } from '@neo9/n9-node-log';
import { Body, HeaderParams, Inject, JsonController, Post, Service } from '../../../../src';
import { BodyModel } from './body.model';
import { HeadersModel } from './headers.model';
import { QueryParamsModel } from './query-params.model';

@Service()
@JsonController()
export class DefaultValuesController {
	@Inject('logger') private logger: N9Log;

	@Post('/default-values')
	public async do(
		@Body() body: BodyModel,
		@QueryParams() queryParams: QueryParamsModel,
		@HeaderParams() headers: HeadersModel,
	): Promise<any> {
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
