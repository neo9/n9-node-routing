import { NextFunction, Response, Request } from 'express';
import { Middleware, ExpressErrorMiddlewareInterface } from "routing-controllers";

@Middleware({ type: "after" })
export class CustomErrorHandler implements ExpressErrorMiddlewareInterface {

	error(error: any, request: Request, response: Response, next: NextFunction) {
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
