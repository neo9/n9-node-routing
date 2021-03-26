import { N9Log } from '@neo9/n9-node-log';
import * as Sentry from '@sentry/node';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Inject, Service } from 'typedi';
import { N9NodeRouting } from '..';

@Service()
@Middleware({ type: 'before' })
export class SentryTracingInterceptor implements ExpressMiddlewareInterface {
	private readonly tracingHandler: RequestHandler;

	constructor(
		@Inject('logger') logger: N9Log,
		@Inject('N9NodeRoutingOptions') private n9NodeRoutingOptions: N9NodeRouting.Options,
	) {
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
