import { ExpressMiddlewareInterface, Middleware } from '@benjd90/routing-controllers';
import { NextFunction, Request, Response } from 'express';
import { Service } from 'typedi';

@Service()
@Middleware({ type: 'before' })
export class SessionLoaderInterceptor implements ExpressMiddlewareInterface {
	public use(request: Request, response: Response, next: NextFunction): void {
		if (request.headers.session) {
			(request as any).session = request.headers.session;
		}
		next();
	}
}
