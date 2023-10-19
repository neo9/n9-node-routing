import { IncomingMessage } from 'node:http';

import { N9Log, safeStringify } from '@neo9/n9-node-log';
import { N9Error } from '@neo9/n9-node-utils';
import { getNamespace } from 'cls-hooked';
import got, { Method, Options as GotOptions } from 'got';
import { RequestError } from 'got/dist/source/core';
import { nanoid } from 'nanoid';
import * as QueryString from 'query-string';
import { PassThrough } from 'stream';

import urlJoin = require('url-join');
import {
	HttpClientGotOptions,
	HttpClientOptions,
	HttpClientSensitiveHeadersOptions,
} from '../models/routing/options-http-client';
import { RequestIdKey, RequestIdNamespaceName } from '../requestid';
import { getEnvironment } from '../utils';

export type N9HttpClientQueryParams =
	| string
	| Record<string, string | number | boolean | string[] | number[] | boolean[]>
	| object;

export type N9HttpClientRequestGotOptions = Omit<GotOptions, 'headers' | 'method'>;

export class N9HttpClient {
	private static getUriFromUrlParts(url: string | string[]): string {
		let uri;
		if (Array.isArray(url)) uri = urlJoin(...url);
		else uri = urlJoin(url);
		return uri;
	}

	private static prepareErrorCodeAndStatus(e: any): { code: string; status: number } {
		let code;
		if (typeof e.response?.body === 'string') {
			code = e.response?.body.substring(0, 500);
		} else {
			try {
				const errorJson =
					typeof e.response?.body === 'object' ? e.response?.body : JSON.parse(e.response?.body);
				code = errorJson?.code ?? errorJson?.message;
			} catch (error) {
				code = e.code;
			}
		}
		if (!code) code = e.code;

		const status = e.response?.statusCode;
		return { code, status };
	}

	private static alterHeaders(
		headers: Record<string, any>,
		sensitiveHeadersOptions: HttpClientSensitiveHeadersOptions,
	): object {
		if (
			headers &&
			sensitiveHeadersOptions.alterSensitiveHeaders &&
			Object.keys(headers).length > 0
		) {
			for (const header of sensitiveHeadersOptions.sensitiveHeaders) {
				if (!headers[header]) continue;

				const rawHeader = headers[header] as string;
				headers[header] = rawHeader.replace(sensitiveHeadersOptions.alteringFormat, '*');
			}
		}

		return headers;
	}

	private readonly baseClientOptions: HttpClientOptions;

	constructor(
		private readonly logger: N9Log,
		options?: HttpClientOptions,
		private maxBodyLengthToLogError: number = 100,
	) {
		this.baseClientOptions = this.buildHttpClientOptionsWithDefaults(logger, options);
	}

	/**
	 * N9HttpClientQueryParams samples : https://github.com/request/request/blob/master/tests/test-qs.js
	 */
	public async get<T>(
		url: string | string[],
		queryParams?: N9HttpClientQueryParams,
		headers?: object,
		options?: N9HttpClientRequestGotOptions,
	): Promise<T> {
		return this.request<T>('get', url, queryParams, headers, undefined, options);
	}

	public async post<T>(
		url: string | string[],
		body?: any,
		queryParams?: N9HttpClientQueryParams,
		headers?: object,
		options?: N9HttpClientRequestGotOptions,
	): Promise<T> {
		return this.request<T>('post', url, queryParams, headers, body, options);
	}

	public async put<T>(
		url: string | string[],
		body?: any,
		queryParams?: N9HttpClientQueryParams,
		headers?: object,
		options?: N9HttpClientRequestGotOptions,
	): Promise<T> {
		return this.request<T>('put', url, queryParams, headers, body, options);
	}

	public async delete<T>(
		url: string | string[],
		body?: any,
		queryParams?: N9HttpClientQueryParams,
		headers?: object,
		options?: N9HttpClientRequestGotOptions,
	): Promise<T> {
		return this.request<T>('delete', url, queryParams, headers, body, options);
	}

	public async options<T>(
		url: string | string[],
		queryParams?: N9HttpClientQueryParams,
		headers?: object,
		options?: N9HttpClientRequestGotOptions,
	): Promise<T> {
		return this.request<T>('options', url, queryParams, headers, undefined, options);
	}

	public async patch<T>(
		url: string | string[],
		body?: any,
		queryParams?: N9HttpClientQueryParams,
		headers?: object,
		options?: N9HttpClientRequestGotOptions,
	): Promise<T> {
		return this.request<T>('patch', url, queryParams, headers, body, options);
	}

	public async head(
		url: string | string[],
		queryParams?: N9HttpClientQueryParams,
		headers?: object,
		options?: N9HttpClientRequestGotOptions,
	): Promise<void> {
		return this.request<void>('head', url, queryParams, headers, undefined, options);
	}

	public async request<T>(
		method: Method,
		url: string | string[],
		queryParams?: N9HttpClientQueryParams,
		headers: object = this.baseClientOptions.gotOptions.headers,
		body?: any,
		options: N9HttpClientRequestGotOptions = {},
	): Promise<T> {
		const uri = N9HttpClient.getUriFromUrlParts(url);

		const namespaceRequestId = getNamespace(RequestIdNamespaceName);
		const requestId: string = namespaceRequestId?.get(RequestIdKey) || nanoid(10);
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const sentHeaders = { ...headers, 'x-request-id': requestId };
		const searchParams =
			typeof queryParams === 'string'
				? queryParams
				: QueryString.stringify(queryParams, { arrayFormat: 'none' });
		const startTime = Date.now();

		const optionsSent: GotOptions = {
			...this.baseClientOptions.gotOptions,
			method,
			searchParams,
			headers: sentHeaders,
			json: body,
			...options,
		};

		try {
			const res = await got<T>(uri, optionsSent as any);

			// for responses 204
			if (optionsSent.responseType === 'json' && (res.body as any) === '') return;
			return res.body;
		} catch (e) {
			const durationMs = Date.now() - startTime;
			const bodyJSON = safeStringify(body);
			const { code, status } = N9HttpClient.prepareErrorCodeAndStatus(e);
			this.logger.error(`Error on [${method} ${uri}] ${e.message}`, {
				uri,
				method,
				status,
				durationMs,
			});

			const alteredHeaders = N9HttpClient.alterHeaders(
				optionsSent.headers,
				this.baseClientOptions.sensitiveHeadersOptions,
			);

			throw new N9Error(code.toString(), status, {
				uri,
				method,
				queryParams,
				durationMs,
				code: e.code ?? e.message,
				body: body && bodyJSON.length < this.maxBodyLengthToLogError ? bodyJSON : undefined,
				headers: alteredHeaders,
				srcError: e.response?.body ?? e,
			});
		}
	}

	public async raw<T>(url: string | string[], options: GotOptions): Promise<T> {
		const uri = N9HttpClient.getUriFromUrlParts(url);
		const startTime = Date.now();

		const optionsSent: GotOptions = {
			...this.baseClientOptions.gotOptions,
			...options,
		};

		try {
			const res = await got<T>(uri, optionsSent as any);

			// for responses 204
			if (optionsSent.responseType === 'json' && (res.body as any) === '') return;
			return res.body;
		} catch (e) {
			const durationMs = Date.now() - startTime;
			const { code, status } = N9HttpClient.prepareErrorCodeAndStatus(e);
			this.logger.error(`Error on [${options.method} ${uri}]`, {
				status,
				durationMs,
			});

			const alteredHeaders = N9HttpClient.alterHeaders(
				optionsSent.headers,
				this.baseClientOptions.sensitiveHeadersOptions,
			);

			throw new N9Error(code.toString(), status, {
				uri,
				options: safeStringify({ ...optionsSent, headers: alteredHeaders }),
				error: e,
				...e.context,
			});
		}
	}

	public async requestStream(
		url: string | string[],
		// issue https://github.com/sindresorhus/got/issues/954#issuecomment-579468831
		options?: Omit<GotOptions, 'isStream' | 'responseType' | 'resolveBodyOnly'>,
	): Promise<{ incomingMessage: IncomingMessage; responseAsStream: PassThrough }> {
		const responseAsStream = new PassThrough();
		const startTime = Date.now();
		const uri = N9HttpClient.getUriFromUrlParts(url);
		const requestResponse = got.stream(uri, options);
		requestResponse.pipe(responseAsStream);

		let incomingMessage: IncomingMessage;
		let durationMsTTFB: number;
		try {
			incomingMessage = await new Promise<IncomingMessage>((resolve, reject) => {
				requestResponse.on('error', (err) => reject(err));
				requestResponse.on('response', (response) => {
					response.on('end', () => {
						const durationMsTTLB = Date.now() - startTime;
						if (durationMsTTFB !== null && durationMsTTFB !== undefined) {
							const durationDLMs = durationMsTTLB - durationMsTTFB;
							this.logger.debug(`File TTLB : ${durationMsTTLB} ms TTDL : ${durationDLMs} ms`, {
								durationDLMs,
								url,
								durationMs: durationMsTTLB,
							});
						} else {
							this.logger.debug(`File TTLB : ${durationMsTTLB} ms`, {
								url,
								durationMs: durationMsTTLB,
							});
						}
					});
					if (response.statusCode >= 400) {
						reject(response);
					}
					resolve(response);
				});
			});
		} catch (e) {
			const durationMs = Date.now() - startTime;
			this.logger.error(`Error on [${options?.method ?? 'GET'} ${uri}]`, {
				status: e.statusCode,
				durationMs,
			});
			this.logger.debug(`File TTFB : ${durationMs} ms`, {
				url,
				durationMs,
				statusCode: e.statusCode,
			});
			const { code, status } = N9HttpClient.prepareErrorCodeAndStatus(e);
			const alteredHeaders = N9HttpClient.alterHeaders(
				options?.headers,
				this.baseClientOptions.sensitiveHeadersOptions,
			);

			throw new N9Error(code?.toString() || 'unknown-error', status, {
				uri,
				method: options?.method,
				code: e.code || code,
				headers: alteredHeaders,
				srcError: e,
				responseTime: durationMs,
			});
		}
		durationMsTTFB = Date.now() - startTime;
		this.logger.debug(`File TTFB : ${durationMsTTFB} ms`, {
			url,
			durationMs: durationMsTTFB,
			statusCode: incomingMessage.statusCode,
		});
		return { incomingMessage, responseAsStream };
	}

	private buildHttpClientOptionsWithDefaults(
		logger: N9Log,
		clientOptions: HttpClientOptions,
	): HttpClientOptions {
		const environment = getEnvironment();

		const gotOptions: HttpClientGotOptions = {
			responseType: 'json' as any,
			resolveBodyOnly: false,
			hooks: {
				beforeRetry: [
					(options, error?: RequestError, retryCount?: number): void => {
						let level: N9Log.Level;
						if (error?.response?.statusCode && error.response.statusCode < 500) {
							level = 'info';
						} else {
							level = 'warn';
						}
						if (logger.isLevelEnabled(level)) {
							logger[level](
								`Retry call [${options.method} ${options.url?.toString()}] n°${retryCount} due to ${
									error?.code ?? error?.name
								} ${error?.message}`,
								{
									errString: safeStringify(error),
									status: error?.response?.statusCode,
								},
							);
						}
					},
				],
			},
			...clientOptions?.gotOptions,
		};

		const sensitiveHeadersOptions: HttpClientSensitiveHeadersOptions = {
			alterSensitiveHeaders: environment !== 'development',
			sensitiveHeaders: ['Authorization'],
			alteringFormat: /(?!^)[\s\S](?!$)/g,
			...clientOptions?.sensitiveHeadersOptions,
		};

		return { gotOptions, sensitiveHeadersOptions };
	}
}
