import { Body, JsonController, Post } from '@flyacts/routing-controllers';
import { Service } from 'typedi';

@Service()
@JsonController()
export class BarController {

	@Post("/bar")
	public async bar(@Body() body: any): Promise<any> {
		return body;
	}
}
