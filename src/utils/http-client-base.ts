import { N9Log } from '@neo9/n9-node-log';
import { N9Error } from '@neo9/n9-node-utils';
import { getNamespace } from 'cls-hooked';
import fastSafeStringify from 'fast-safe-stringify';
import got, { Method, Options } from 'got';
import { RequestError } from 'got/dist/source/core';
import { IncomingMessage } from 'http';
import * as QueryString from 'query-string';
import * as shortid from 'shortid';
import { PassThrough } from 'stream';
import urlJoin = require('url-join');
import { RequestIdKey, RequestIdNamespaceName } from '../requestid';

export type N9HttpClientQueryParams =
	| string
	| Record<string, string | number | boolean | string[] | number[] | boolean[]>
	| object;

interface HttpClientSensitiveHeadersOptions {
	/**
	 * Should the given sensitive headers be altered.
	 *
	 * @default true
	 */
	alterSensitiveHeaders?: boolean;
	/**
	 * String or regexp to use to match the value to alter. All matching characters will be replaced with an asterisk.
	 *
	 * @default /(?!^)[\s\S](?!$)/ (replace all characters except for the first and last)
	 */
	alteringFormat?: string | RegExp;
	/**
	 * Headers to alter.
	 *
	 * @default ['Authorization']
	 */
	sensitiveHeaders?: string[];
}

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
		headers: object,
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

	private readonly baseOptions: Options;
	private readonly baseSensitiveHeadersOptions: HttpClientSensitiveHeadersOptions = {
		alterSensitiveHeaders: true,
		sensitiveHeaders: ['Authorization'],
		alteringFormat: /(?!^)[\s\S](?!$)/g,
	};

	constructor(
		private readonly logger: N9Log = (global as any).log,
		baseOptions?: Options,
		private maxBodyLengthToLogError: number = 100,
	) {
		this.baseOptions = {
			responseType: 'json' as any,
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
									errString: fastSafeStringify(error),
									status: error?.response?.statusCode,
								},
							);
						}
					},
				],
			},
			...baseOptions,
		};
	}

	/**
	 * N9HttpClientQueryParams samples : https://github.com/request/request/blob/master/tests/test-qs.js
	 */
	public async get<T>(
		url: string | string[],
		queryParams?: N9HttpClientQueryParams,
		headers: object = {},
		options: Options = {},
	): Promise<T> {
		return this.request<T>('get', url, queryParams, headers, undefined, options);
	}

	public async post<T>(
		url: string | string[],
		body?: any,
		queryParams?: N9HttpClientQueryParams,
		headers: object = {},
		options: Options = {},
	): Promise<T> {
		return this.request<T>('post', url, queryParams, headers, body, options);
	}

	public async put<T>(
		url: string | string[],
		body?: any,
		queryParams?: N9HttpClientQueryParams,
		headers: object = {},
		options: Options = {},
	): Promise<T> {
		return this.request<T>('put', url, queryParams, headers, body, options);
	}

	public async delete<T>(
		url: string | string[],
		body?: any,
		queryParams?: N9HttpClientQueryParams,
		headers: object = {},
		options: Options = {},
	): Promise<T> {
		return this.request<T>('delete', url, queryParams, headers, body, options);
	}

	public async options<T>(
		url: string | string[],
		queryParams?: N9HttpClientQueryParams,
		headers: object = {},
		options: Options = {},
	): Promise<T> {
		return this.request<T>('options', url, queryParams, headers, undefined, options);
	}

	public async patch<T>(
		url: string | string[],
		body?: any,
		queryParams?: N9HttpClientQueryParams,
		headers: object = {},
		options: Options = {},
	): Promise<T> {
		return this.request<T>('patch', url, queryParams, headers, body, options);
	}

	public async head(
		url: string | string[],
		queryParams?: N9HttpClientQueryParams,
		headers: object = {},
		options: Options = {},
	): Promise<void> {
		return this.request<void>('head', url, queryParams, headers, undefined, options);
	}

	public async request<T>(
		method: Method,
		url: string | string[],
		queryParams?: N9HttpClientQueryParams,
		headers: object = {},
		body?: any,
		options: Options = {},
	): Promise<T> {
		const uri = N9HttpClient.getUriFromUrlParts(url);

		const namespaceRequestId = getNamespace(RequestIdNamespaceName);
		const requestId: string = namespaceRequestId?.get(RequestIdKey) || shortid.generate();
		const sentHeaders = { ...headers, 'x-request-id': requestId };
		const searchParams =
			typeof queryParams === 'string'
				? queryParams
				: QueryString.stringify(queryParams, { arrayFormat: 'none' });
		const startTime = Date.now();

		const optionsSent: Options = {
			method,
			searchParams,
			headers: sentHeaders,
			json: body,
			resolveBodyOnly: false,
			...this.baseOptions,
			...options,
		};

		try {
			const res = await got<T>(uri, optionsSent as any);

			// for responses 204
			if (optionsSent.responseType === 'json' && (res.body as any) === '') return;
			return res.body;
		} catch (e) {
			const responseTime = Date.now() - startTime;
			const bodyJSON = fastSafeStringify(body);
			const { code, status } = N9HttpClient.prepareErrorCodeAndStatus(e);
			this.logger.error(`Error on [${method} ${uri}] ${e.message}`, {
				uri,
				method,
				status,
				'response-time': responseTime,
			});

			const alteredHeaders = N9HttpClient.alterHeaders(
				optionsSent.headers,
				this.baseSensitiveHeadersOptions,
			);

			throw new N9Error(code.toString(), status, {
				uri,
				method,
				queryParams,
				responseTime,
				code: e.code ?? e.message,
				body: body && bodyJSON.length < this.maxBodyLengthToLogError ? bodyJSON : undefined,
				headers: alteredHeaders,
				srcError: e.response?.body ?? e,
			});
		}
	}

	public async raw<T>(url: string | string[], options: Options): Promise<T> {
		const uri = N9HttpClient.getUriFromUrlParts(url);
		const startTime = Date.now();

		const optionsSent: Options = {
			resolveBodyOnly: false,
			...this.baseOptions,
			...options,
		};

		try {
			const res = await got<T>(uri, optionsSent as any);

			// for responses 204
			if (optionsSent.responseType === 'json' && (res.body as any) === '') return;
			return res.body;
		} catch (e) {
			const responseTime = Date.now() - startTime;
			const { code, status } = N9HttpClient.prepareErrorCodeAndStatus(e);
			this.logger.error(`Error on [${options.method} ${uri}]`, {
				status,
				'response-time': responseTime,
			});

			const alteredHeaders = N9HttpClient.alterHeaders(
				optionsSent.headers,
				this.baseSensitiveHeadersOptions,
			);

			throw new N9Error(code.toString(), status, {
				uri,
				options: fastSafeStringify({ ...optionsSent, headers: alteredHeaders }),
				error: e,
				...e.context,
			});
		}
	}

	public async requestStream(
		url: string | string[],
		// issue https://github.com/sindresorhus/got/issues/954#issuecomment-579468831
		options?: Omit<Options, 'isStream' | 'responseType' | 'resolveBodyOnly'>,
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
			const durationCatch = Date.now() - startTime;
			this.logger.error(`Error on [${options?.method ?? 'GET'} ${uri}]`, {
				'status': e.statusCode,
				'response-time': durationCatch,
			});
			this.logger.debug(`File TTFB : ${durationCatch} ms`, {
				url,
				durationMs: durationCatch,
				statusCode: e.statusCode,
			});
			const { code, status } = N9HttpClient.prepareErrorCodeAndStatus(e);

			const alteredHeaders = N9HttpClient.alterHeaders(
				options?.headers,
				this.baseSensitiveHeadersOptions,
			);

			throw new N9Error(code?.toString() || 'unknown-error', status, {
				uri,
				method: options?.method,
				code: e.code || code,
				headers: alteredHeaders,
				srcError: e,
				responseTime: durationCatch,
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
}
