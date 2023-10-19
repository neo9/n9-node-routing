import { ExpressErrorMiddlewareInterface, Middleware } from '@benjd90/routing-controllers';
import { N9Log, safeStringify } from '@neo9/n9-node-log';
import * as Sentry from '@sentry/node';
import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { Service } from 'typedi';

import * as N9NodeRouting from '../models/routing';

function removePropertiesRecursively(obj: object, keys: string[]): void {
	if (!obj) return;

	if (obj instanceof Array) {
		obj.forEach((item) => {
			removePropertiesRecursively(item, keys);
		});
	} else if (typeof obj === 'object') {
		Object.getOwnPropertyNames(obj).forEach((key) => {
			if (keys.includes(key)) delete (obj as any)[key];
			else removePropertiesRecursively((obj as any)[key], keys);
		});
	}
}

@Service()
@Middleware({ type: 'after' })
export class ErrorHandler implements ExpressErrorMiddlewareInterface {
	private readonly sentryErrorHandler: ErrorRequestHandler;
	private readonly newRelicNoticeError: (
		error: Error,
		customAttributes?: { [key: string]: string | number | boolean },
	) => void;

	constructor(
		private logger: N9Log,
		private n9NodeRoutingOptions: N9NodeRouting.Options,
	) {
		if (this.n9NodeRoutingOptions.sentry) {
			this.sentryErrorHandler = Sentry.Handlers.errorHandler(
				this.n9NodeRoutingOptions.sentry.errorHandlerOptions,
			);
		}
		if (this.n9NodeRoutingOptions.apm?.type === 'newRelic') {
			// eslint-disable-next-line @typescript-eslint/no-var-requires,global-require
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
		removePropertiesRecursively(context, ['stack']);

		error.code = code;

		if (status < 500) {
			this.logger.warn(code, { errString: safeStringify(error) });
		} else {
			this.logger.error(code, { errString: safeStringify(error) });
		}

		if (this.sentryErrorHandler) {
			this.sentryErrorHandler(error, request, response, next);
		}
		if (this.newRelicNoticeError) {
			try {
				this.newRelicNoticeError(error, { errString: safeStringify(error) });
			} catch (e) {
				this.logger.warn(`Error while sending error to newrelic`, {
					errString: safeStringify(e),
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
