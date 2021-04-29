import { ExpressErrorMiddlewareInterface, Middleware } from '@benjd90/routing-controllers';
import * as Sentry from '@sentry/node';
import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import fastSafeStringify from 'fast-safe-stringify';
import { Inject, Service } from 'typedi';
import { N9NodeRouting } from '..';

@Service()
@Middleware({ type: 'after' })
export class ErrorHandler implements ExpressErrorMiddlewareInterface {
	private readonly sentryErrorHandler: ErrorRequestHandler;
	private readonly newRelicNoticeError: (
		error: Error,
		customAttributes?: { [key: string]: string | number | boolean },
	) => void;

	constructor(@Inject('N9NodeRoutingOptions') private n9NodeRoutingOptions: N9NodeRouting.Options) {
		if (this.n9NodeRoutingOptions.sentry) {
			this.sentryErrorHandler = Sentry.Handlers.errorHandler(
				this.n9NodeRoutingOptions.sentry.errorHandlerOptions,
			);
		}
		if (this.n9NodeRoutingOptions.apm?.type === 'newRelic') {
			this.newRelicNoticeError = require('newrelic').noticeError;
		}
	}

	public error(error: any, request: Request, response: Response, next: NextFunction): void {
		const status = error.status || error.httpCode || 500;
		let code = 'unspecified-error';
		if (error.code) {
			code = error.code;
		} else if (error.name && error.name !== 'Error') {
			code = error.name;
		} else if (error.message) {
			code = error.message;
		}
		const context = error.context || error.errors || {};
		// remove stack properties to avoid leak
		removeProps(context, ['stack']);

		error.code = code;

		if (status < 500) {
			((global as any).log || console).warn(code, { errString: fastSafeStringify(error) });
		} else {
			((global as any).log || console).error(code, { errString: fastSafeStringify(error) });
		}

		if (this.sentryErrorHandler) {
			this.sentryErrorHandler(error, request, response, next);
		}
		if (this.newRelicNoticeError) {
			try {
				this.newRelicNoticeError(error, { errString: fastSafeStringify(error) });
			} catch (e) {
				((global as any).log || console).warn(`Error while sending error to newrelic`, {
					errString: fastSafeStringify(e),
				});
			}
		}

		response.status(status);
		response.json({
			code,
			status,
			context,
		});
	}
}

function removeProps(obj: object, keys: string[]): void {
	if (!obj) return;

	if (obj instanceof Array) {
		obj.forEach((item) => {
			removeProps(item, keys);
		});
	} else if (typeof obj === 'object') {
		Object.getOwnPropertyNames(obj).forEach((key) => {
			if (keys.includes(key)) delete obj[key];
			else removeProps(obj[key], keys);
		});
	}
}
