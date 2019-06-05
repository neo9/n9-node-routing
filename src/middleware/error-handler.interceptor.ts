import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { NextFunction, Request, Response } from 'express';

@Catch()
export class AllErrorsFilter implements BaseExceptionFilter {

	public catch(error: any, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response: Response = ctx.getResponse();
		const request: Request = ctx.getRequest();
		console.log(`-- error-handler.interceptor.ts all errors filter --`);
		const status = error.status || error.httpCode || 500;
		let code = 'unspecified-error';
		if (error.name && error.name !== 'Error') {
			code = error.name;
		} else if (error.message) {
			code = error.message;
		}
		const context = error.context || error.errors || {};
		if (status < 500) {
			(global.log || console).warn(error, JSON.stringify(error));
		} else {
			(global.log || console).error(error);
		}

		response.status(status);
		response.json({
			code,
			status,
			context,
		});
	}

	isExceptionObject(err: any): err is Error {
		return true;
	}
}
