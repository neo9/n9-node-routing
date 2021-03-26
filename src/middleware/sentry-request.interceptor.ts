import * as Sentry from '@sentry/node';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Inject, Service } from 'typedi';
import { N9NodeRouting } from '..';

@Service()
@Middleware({ type: 'before' })
export class SentryRequestInterceptor implements ExpressMiddlewareInterface {
	private readonly requestHandler: RequestHandler;

	constructor(@Inject('N9NodeRoutingOptions') private n9NodeRoutingOptions: N9NodeRouting.Options) {
		if (this.n9NodeRoutingOptions.sentry) {
			this.requestHandler = Sentry.Handlers.requestHandler(
				this.n9NodeRoutingOptions.sentry.requestHandlerOptions,
			);
		}
	}

	public use(request: Request, response: Response, next: NextFunction): void {
		if (this.requestHandler) {
			this.requestHandler(request, response, next);
		} else {
			next();
		}
	}
}
