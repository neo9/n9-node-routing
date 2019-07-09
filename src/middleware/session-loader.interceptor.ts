import { NextFunction, Request, Response } from 'express';

export class SessionLoaderInterceptor {
	public static use(request: Request, response: Response, next: NextFunction): void {
		if (request.headers.session) {
			(request as any).session = request.headers.session;
		}
		next();
	}
}
