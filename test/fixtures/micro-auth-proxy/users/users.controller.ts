import { Controller, Get, Session, UseGuards } from '@nestjs/common';
import { SessionLoaderInterceptor } from '../../../../src/middleware/session-loader.interceptor';

@Controller()
export class UsersController {

	@Get("/me")
	@UseGuards(SessionLoaderInterceptor.getAuthCheckerFunction())
	public async me(@Session() session: any): Promise<any> {
		return session;
	}

	@Get('/me-load')
	public async load(@Session() session: any): Promise<any> {
		return session || { session: false };
	}
}
