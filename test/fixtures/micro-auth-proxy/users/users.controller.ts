import { Body, Controller, Get, Param, Post, Query, Session, UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from '../../../../src';

@Controller()
export class UsersController {

	@Get("/me")
	@UseGuards(SessionAuthGuard)
	public async me(@Session() session: any): Promise<any> {
		return session;
	}

	@Get('/me-load')
	public async load(@Session() session: any): Promise<any> {
		return session || { session: false };
	}
}
