import { ExpressErrorMiddlewareInterface, Middleware } from '@flyacts/routing-controllers';
import { Request, Response } from 'express';
import stringify from 'fast-safe-stringify';

@Middleware({ type: 'after' })
export class ErrorHandler implements ExpressErrorMiddlewareInterface {

	public error(error: any, request: Request, response: Response): void {
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
		error.code = code;

		if (status < 500) {
			(global.log || console).warn(code, { errString: stringify(error) });
		} else {
			(global.log || console).error(code, { errString: stringify(error) });
		}

		response.status(status);
		response.json({
			code,
			status,
			context,
		});
	}
}
