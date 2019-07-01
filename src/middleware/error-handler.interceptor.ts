import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';
import * as _ from 'lodash';

@Catch()
export class AllErrorsFilter implements BaseExceptionFilter {

	public catch(error: any, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response: Response = ctx.getResponse();
		// const request: Request = ctx.getRequest();

		if(error instanceof HttpException) {
			let body;
			if(error.message && error.message.error) {
				body = {
					code: error.message.error.toLowerCase().replace(' ', '-'),
					status: error.getStatus(),
					context: {
						error
					}
				}
			} else {
				body = {
					code: _.get(error.message, 'error', error.message),
					status: error.getStatus(),
					context: {
						error
					}
				};
			}

			response
					.status(error.getStatus())
					.json(body);
		} else {
			console.log(`-- error-handler.interceptor.ts all errors filter --`, typeof error, error instanceof HttpException, JSON.stringify(error));
			console.log(`-- -------------------------------- --`);
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
	}

	isExceptionObject(err: any): err is Error {
		return true;
	}
}
