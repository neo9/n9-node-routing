import { Authorized, Get, JsonController, Session } from 'routing-controllers';
import { Service } from 'typedi';

@Service()
@JsonController()
export class UsersController {
	@Get('/me')
	@Authorized()
	public async me(@Session() session: any): Promise<any> {
		return session;
	}

	@Get('/me-load')
	public async load(@Session() session: any): Promise<any> {
		return session || { session: false };
	}
}
