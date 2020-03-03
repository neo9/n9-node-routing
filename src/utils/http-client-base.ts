import { N9Log } from '@neo9/n9-node-log';
import { N9Error } from '@neo9/n9-node-utils';
import { getNamespace } from 'continuation-local-storage';
import { RequestIdNamespaceName } from '../requestid';
import stringify from 'fast-safe-stringify';
import got, { Method, Options } from 'got';
import { IncomingMessage } from 'http';
import { PassThrough } from 'stream';
import UrlJoin = require('url-join');

export type QueryParams = string | Record<string, string | number | boolean> | URLSearchParams;

export class N9HttpClient {
	private static getUriFromUrlParts(url: string | string[]): string {
		let uri;
		if (Array.isArray(url)) uri = UrlJoin(...url);
		else uri = UrlJoin(url);
		return uri;
	}

	constructor(
		private readonly logger: N9Log = global.log,
		private baseOptions: Options = { responseType: 'json' },
		private maxBodyLengthToLogError: number = 100,
	) {}

	/**
	 * QueryParams samples : https://github.com/request/request/blob/master/tests/test-qs.js
	 */
	public async get<T>(
		url: string | string[],
		queryParams?: QueryParams,
		headers: object = {},
		options: Options = {},
	): Promise<T> {
		return this.request<T>('get', url, queryParams, headers, undefined, options);
	}

	public async post<T>(
		url: string | string[],
		body?: any,
		queryParams?: QueryParams,
		headers: object = {},
		options: Options = {},
	): Promise<T> {
		return this.request<T>('post', url, queryParams, headers, body, options);
	}

	public async put<T>(
		url: string | string[],
		body?: any,
		queryParams?: QueryParams,
		headers: object = {},
		options: Options = {},
	): Promise<T> {
		return this.request<T>('put', url, queryParams, headers, body, options);
	}

	public async delete<T>(
		url: string | string[],
		body?: any,
		queryParams?: QueryParams,
		headers: object = {},
		options: Options = {},
	): Promise<T> {
		return this.request<T>('delete', url, queryParams, headers, body, options);
	}

	public async options<T>(
		url: string | string[],
		queryParams?: QueryParams,
		headers: object = {},
		options: Options = {},
	): Promise<T> {
		return this.request<T>('options', url, queryParams, headers, undefined, options);
	}

	public async patch<T>(
		url: string | string[],
		body?: any,
		queryParams?: QueryParams,
		headers: object = {},
		options: Options = {},
	): Promise<T> {
		return this.request<T>('patch', url, queryParams, headers, body, options);
	}

	public async head(
		url: string | string[],
		queryParams?: QueryParams,
		headers: object = {},
		options: Options = {},
	): Promise<void> {
		return this.request<void>('head', url, queryParams, headers, undefined, options);
	}

	public async request<T>(
		method: Method,
		url: string | string[],
		queryParams?: string | Record<string, string | number | boolean> | URLSearchParams,
		headers: object = {},
		body?: any,
		options: Options = {},
	): Promise<T> {
		const uri = N9HttpClient.getUriFromUrlParts(url);

		const namespaceRequestId = getNamespace(RequestIdNamespaceName);
		const requestId = namespaceRequestId && namespaceRequestId.get('request-id');
		const sentHeaders = Object.assign({}, headers, { 'x-request-id': requestId });
		const startTime = Date.now();

		try {
			const optionsSent: Options = {
				method,
				searchParams: queryParams,
				headers: sentHeaders,
				json: body,
				resolveBodyOnly: false,
				...this.baseOptions,
				...options,
			};
			const res = await got<T>(uri, optionsSent as any);
			// console.log(`-- http-client-base.ts res --`, res);
			return res.body;
		} catch (e) {
			const responseTime = Date.now() - startTime;
			const bodyJSON = stringify(body);
			const errorBodyJSON = stringify(e.response?.body);
			const { code, status } = this.prepareErrorCodeAndStatus(e);
			this.logger.error(`Error on [${method} ${uri}]`, {
				'status': status,
				'response-time': responseTime,
			});

			throw new N9Error(code, status, {
				uri,
				method,
				code: e.code,
				queryParams,
				headers,
				body: body && bodyJSON.length < this.maxBodyLengthToLogError ? bodyJSON : undefined,
				srcError: e.response?.body,
				responseTime,
			});
		}
	}

	public async raw<T>(url: string | string[], options: Options): Promise<T> {
		const uri = N9HttpClient.getUriFromUrlParts(url);
		const startTime = Date.now();

		try {
			const res = await got<T>(uri, {
				resolveBodyOnly: false,
				...this.baseOptions,
				...options,
			} as any);

			return res.body;
		} catch (e) {
			const responseTime = Date.now() - startTime;
			const { code, status } = this.prepareErrorCodeAndStatus(e);
			this.logger.error(`Error on [${options.method} ${uri}]`, {
				status,
				'response-time': responseTime,
			});

			throw new N9Error(code, status, {
				uri,
				options: stringify(options),
				error: e,
				...e.context,
			});
		}
	}

	public async requestStream(
		url: string | string[],
		options?: Options,
	): Promise<{ incomingMessage: IncomingMessage; responseAsStream: PassThrough }> {
		const responseAsStream = new PassThrough();
		const startTime = Date.now();
		const uri = N9HttpClient.getUriFromUrlParts(url);
		const requestResponse = await got.stream(uri, options);
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
								durationMs: durationMsTTLB,
								durationDLMs,
								url,
							});
						} else {
							this.logger.debug(`File TTLB : ${durationMsTTLB} ms`, {
								durationMs: durationMsTTLB,
								url,
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
			this.logger.error(`Error on [${options ? options.method || 'GET' : 'GET'} ${uri}]`, {
				'status': e.statusCode,
				'response-time': durationCatch,
			});
			this.logger.debug(`File TTFB : ${durationCatch} ms`, {
				durationMs: durationCatch,
				statusCode: e.statusCode,
				url,
			});
			const { code, status } = this.prepareErrorCodeAndStatus(e);

			throw new N9Error(code || 'unknown-error', status, {
				uri,
				method: options && options.method,
				code: e.code || code,
				headers: options && options.headers,
				srcError: e,
				responseTime: durationCatch,
			});
		}
		durationMsTTFB = Date.now() - startTime;
		this.logger.debug(`File TTFB : ${durationMsTTFB} ms`, {
			durationMs: durationMsTTFB,
			statusCode: incomingMessage.statusCode,
			url,
		});
		return { incomingMessage, responseAsStream };
	}

	private prepareErrorCodeAndStatus(e: any): { code: string; status: number } {
		// console.log(`-- http-client-base.ts e --`, e);
		// console.log(`-- http-client-base.ts e.response --`, e.response);
		// console.log(`-- http-client-base.ts JSON.stringify(e) --`, JSON.stringify(e));

		let code;
		try {
			const errorJson =
				typeof e.response?.body === 'object' ? e.response?.body : JSON.parse(e.response?.body);
			code = errorJson?.code;
		} catch (error) {
			code = e.code;
		}
		if (!code) code = e.code;

		const status = e.response?.statusCode;
		// console.log(`-- ----------------  --`);
		// console.log(`-- ----------------  --`);
		// console.log(`-- ----------------  --`);
		// console.log(`-- http-client-base.ts {code, status } --`, { code, status });
		// console.log(`-- ----------------  --`);
		// console.log(`-- ----------------  --`);
		// console.log(`-- ----------------  --`);
		return { code, status };
	}
}
