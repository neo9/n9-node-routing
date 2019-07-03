import { Body, Controller, Post } from '@nestjs/common';

@Controller()
export class BarController {

	@Post("/bar")
	public async bar(@Body() body: any): Promise<any> {
		return body;
	}
}
