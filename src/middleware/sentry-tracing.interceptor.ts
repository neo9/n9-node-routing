import * as Sentry from '@sentry/node';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Service } from 'typedi';

import * as N9NodeRouting from '../models/routing';

@Service()
@Middleware({ type: 'before' })
export class SentryTracingInterceptor implements ExpressMiddlewareInterface {
	private readonly tracingHandler: RequestHandler;

	constructor(private n9NodeRoutingOptions: N9NodeRouting.Options) {
		if (this.n9NodeRoutingOptions.sentry) {
			this.tracingHandler = Sentry.Handlers.tracingHandler();
		}
	}

	public use(request: Request, response: Response, next: NextFunction): void {
		if (this.tracingHandler) {
			this.tracingHandler(request, response, next);
		} else {
			next();
		}
	}
}
