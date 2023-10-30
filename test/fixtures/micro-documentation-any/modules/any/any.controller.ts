import { HeaderParams, QueryParams } from 'routing-controllers';
import { Service } from 'typedi';

import { Body, JsonController, Post } from '../../../../../src';

@Service()
@JsonController()
export class AnyController {
	@Post('/validate')
	public validate(
		@QueryParams() queryParams: object,
		@HeaderParams() headers: object,
		@Body() body: object,
	): any {
		return { body };
	}
}
