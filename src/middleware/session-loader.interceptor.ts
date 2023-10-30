import { NextFunction, Request, Response } from 'express';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
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
