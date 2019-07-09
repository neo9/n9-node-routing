import { N9Error } from '@neo9/n9-node-utils';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class SessionAuthGuard implements CanActivate {
	public canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest();
		if (!request.headers.session) {
			throw new N9Error('session-required', 401);
		}
		try {
			request.session = JSON.parse(request.headers.session);
		} catch (err) {
			throw new N9Error('session-header-is-invalid', 401);
		}
		if (!request.session.userId) {
			throw new N9Error('session-header-has-no-userId', 401);
		}
		return true;
	}
}
