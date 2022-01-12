import { Body, JsonController, Post, Service } from '../../../../src';

@Service()
@JsonController()
export class BarController {
	@Post('/bar')
	public bar(@Body() body: any): any {
		return body;
	}
}
