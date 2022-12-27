import { ExpressMiddlewareInterface, Middleware } from '@benjd90/routing-controllers';
import { N9Log } from '@neo9/n9-node-log';
import * as Sentry from '@sentry/node';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { Inject, Service } from 'typedi';

import * as N9NodeRouting from '../models/routing';

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
