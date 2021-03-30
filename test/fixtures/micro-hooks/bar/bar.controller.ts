import { Body, JsonController, Post, Service } from '../../../../src';

@Service()
@JsonController()
export class BarController {
	@Post('/bar')
	public async bar(@Body() body: any): Promise<any> {
		return body;
	}
}
