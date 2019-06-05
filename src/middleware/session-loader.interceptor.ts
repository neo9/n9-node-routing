import { N9Error } from '@neo9/n9-node-utils';
import { NextFunction, Request, Response } from 'express';

export class SessionLoaderInterceptor {
	public static use(request: Request, response: Response, next: NextFunction): void {
		if (request.headers.session) {
			(request as any).session = request.headers.session;
		}
		next();
	}

	public static getAuthCheckerFunction() {
		console.log(`-- session-loader.interceptor.ts arguments --`, arguments);
		return async (action: any, roles: string[]) => {
			// TODO: migrate to nest
			if (!action.request.headers.session) {
				throw new N9Error('session-required', 401);
			}
			try {
				action.request.session = JSON.parse(action.request.headers.session);
			} catch (err) {
				throw new N9Error('session-header-is-invalid', 401);
			}
			if (!action.request.session.userId) {
				throw new N9Error('session-header-has-no-userId', 401);
			}
			return true;
		};
	}
}
