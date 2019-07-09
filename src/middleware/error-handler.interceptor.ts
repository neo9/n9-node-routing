import { N9Error } from '@neo9/n9-node-utils';
import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';
import * as _ from 'lodash';

@Catch()
export class AllErrorsFilter implements BaseExceptionFilter {

	public catch(error: any, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response: Response = ctx.getResponse();
		const request: Request = ctx.getRequest();
		const url = request.url;

		if (error instanceof HttpException) {
			let body;
			if (error.message && error.message.error) {
				let err;
				switch (error.message.error) {
					case 'Bad Request':
						err = new N9Error(error.message.error.toLowerCase().replace(' ', '-'), error.getStatus(), error.message.message);
						break;
					case 'Not Found':
					default:
						err = new N9Error(error.message.error.toLowerCase().replace(' ', '-'), error.getStatus(), { url });
						break;
				}

				global.log.warn(err as any);
				body = {
					code: err.message,
					status: err.status,
					context: err.context,
				};
			} else {
				body = {
					code: _.get(error.message, 'error', error.message),
					status: error.getStatus(),
					context: {},
				};
			}

			response
					.status(error.getStatus())
					.json(body);
		} else {
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

	public isExceptionObject(err: any): err is Error {
		return true;
	}
}
