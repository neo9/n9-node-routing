import { Service } from 'typedi';

import { Authorized, Get, JsonController, Session } from '../../../../src';

@Service()
@JsonController()
export class UsersController {
	@Get('/me')
	@Authorized()
	public me(@Session() session: any): any {
		return session;
	}

	@Get('/me-load')
	public load(@Session() session: any): any {
		return session || { session: false };
	}
}
