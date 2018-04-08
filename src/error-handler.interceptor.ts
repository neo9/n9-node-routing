import { NextFunction, Request, Response } from 'express';
import { ExpressErrorMiddlewareInterface, Middleware } from "routing-controllers";

@Middleware({ type: "after" })
export class ErrorHandler implements ExpressErrorMiddlewareInterface {

	public error(error: any, request: Request, response: Response, next: NextFunction): void {
		const status = error.status || error.httpCode || 500;
		const code = error.name || error.message || 'unspecified-error';
		const context = error.context || error.errors || {};
		if (status < 500) {
			(global.log || console).warn(error);
		} else {
			(global.log || console).error(error);
		}
		response.status(status);
		response.json({
			code,
			status,
			context
		});
	}
}
