import { Body, JsonController, Post } from "routing-controllers";
import { Service } from "typedi";
import { User } from './users.models';

@Service()
@JsonController()
export class ValidateController {

	@Post("/validate")
	public async validate(@Body() user: User): Promise<any> {
		return { ok: true };
	}

	@Post('/validate-allow-all')
	public async validateOk(@Body({ validate: { forbidNonWhitelisted: false } }) user: User): Promise<any> {
		return { ok: true };
	}
}
