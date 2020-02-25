import { N9Log } from '@neo9/n9-node-log';
import { N9Error } from '@neo9/n9-node-utils';
import { getNamespace } from 'continuation-local-storage';
import { IncomingMessage } from 'http';
import { PassThrough } from 'stream';
import { RequestIdNamespaceName } from '../requestid';
import UrlJoin = require('url-join');
import stringify from 'fast-safe-stringify';
import got from 'got';
import { ExtendOptions, Got, Method, Options } from 'got';
import { Merge } from 'type-fest';
import hasOwnProperty from './has-own-property';

type OptionsOfDefaultResponseBody = Merge<Options, {
	isStream?: false;
	resolveBodyOnly?: false;
	responseType?: 'default';
}>;

type QueryParams =  string | Record<string, string | number | boolean> | URLSearchParams;

export class N9HttpClient {

	private static getUriFromUrlParts(url: string | string[]): string {
		let uri;
		if (Array.isArray(url)) uri = UrlJoin(...url);
		else uri = UrlJoin(url);
		return uri;
	}

	private readonly requestDefault: Got;

	constructor(private readonly logger: N9Log = global.log, options?: ExtendOptions, private maxBodyLengthToLogError: number = 100) {
		this.requestDefault = got.extend(Object.assign({}, options, {
			compress: true
		}));
	}

	/**
	 * QueryParams samples : https://github.com/request/request/blob/master/tests/test-qs.js
	 */
	public async get<T>(url: string | string[], queryParams?: QueryParams, headers: object = {}): Promise<T> {
		return this.request<T>('get', url, queryParams, headers);
	}

	public async post<T>(url: string | string[], body?: any, queryParams?: QueryParams, headers: object = {}): Promise<T> {
		return this.request<T>('post', url, queryParams, headers, body);
	}

	public async put<T>(url: string | string[], body?: any, queryParams?: QueryParams, headers: object = {}): Promise<T> {
		return this.request<T>('put', url, queryParams, headers, body);
	}

	public async delete<T>(url: string | string[], body?: any, queryParams?: QueryParams, headers: object = {}): Promise<T> {
		return this.request<T>('delete', url, queryParams, headers, body);
	}

	public async options<T>(url: string | string[], queryParams?: QueryParams, headers: object = {}): Promise<T> {
		return this.request<T>('options', url, queryParams, headers);
	}

	public async patch<T>(url: string | string[], body?: any, queryParams?: QueryParams, headers: object = {}): Promise<T> {
		return this.request<T>('patch', url, queryParams, headers, body);
	}

	public async head(url: string | string[], queryParams?: QueryParams, headers: object = {}): Promise<void> {
		return this.request<void>('head', url, queryParams, headers);
	}

	public async request<T>(
		method: Method, url: string | string[],
		queryParams?: string | Record<string, string | number | boolean> | URLSearchParams,
		headers: object = {},
		body?: any
	): Promise<T> {
		const uri = N9HttpClient.getUriFromUrlParts(url);

		const namespaceRequestId = getNamespace(RequestIdNamespaceName);
		const requestId = namespaceRequestId && namespaceRequestId.get('request-id');
		const sentHeaders = Object.assign({}, headers, { 'x-request-id': requestId });
		const startTime = Date.now();

		try {
			const res = this.requestDefault(uri, {
				method,
				searchParams: queryParams,
				headers: sentHeaders,
				json: body,
			});
			const ret = await body ? res.json() : res.text();

			return ret as any;
		} catch (e) {
			const responseTime = Date.now() - startTime;
			const bodyJSON = stringify(body);
			const { message, code } = this.prepareErrorMessageAndCode(e);
			this.logger.error(`Error on [${method} ${uri}]`, { 'status': code, 'response-time': responseTime });

			throw new N9Error(message, code, {
				uri,
				method,
				code: e.code,
				queryParams,
				headers,
				body: body && bodyJSON.length < this.maxBodyLengthToLogError ? bodyJSON : undefined,
				srcError: e,
				responseTime,
			});
		}
	}

	public async raw<T>(url: string | string[], options: OptionsOfDefaultResponseBody): Promise<T> {
		const uri = N9HttpClient.getUriFromUrlParts(url);
		const startTime = Date.now();

		try {
			const res = this.requestDefault(uri, options);
			const body = await options.body ?  res.json() : res.text();

			return body as any;
		} catch (e) {
			const { message, code } = this.prepareErrorMessageAndCode(e);
			this.logger.error(`Error on raw call [${options.method} ${uri}]`, { 'status': code, 'response-time': (Date.now() - startTime) });

			throw new N9Error(message, code, {
				uri,
				options: stringify(options),
				error: e,
				...e.context,
			});

		}
	}

	public async requestStream(url: string | string[], options?: Options): Promise<{ incomingMessage: IncomingMessage, responseAsStream: PassThrough }> {
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
							this.logger.debug(`File TTLB : ${durationMsTTLB} ms TTDL : ${durationDLMs} ms`, { durationMs: durationMsTTLB, durationDLMs, url });
						} else {
							this.logger.debug(`File TTLB : ${durationMsTTLB} ms`, { durationMs: durationMsTTLB, url });
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
			this.logger.error(`Error on [${options ? options.method || 'GET' : 'GET'} ${uri}]`, { 'status': e.statusCode, 'response-time': durationCatch });
			this.logger.debug(`File TTFB : ${durationCatch} ms`, { durationMs: durationCatch, statusCode: e.statusCode, url });
			const { message, code } = this.prepareErrorMessageAndCode(e);

			throw new N9Error(message || 'unknown-error', code, {
				uri,
				method: options && options.method,
				code: e.code || code,
				headers: options && options.headers,
				srcError: e,
				responseTime: durationCatch,
			});
		}
		durationMsTTFB = Date.now() - startTime;
		this.logger.debug(`File TTFB : ${durationMsTTFB} ms`, { durationMs: durationMsTTFB, statusCode: incomingMessage.statusCode, url });
		return { incomingMessage, responseAsStream };
	}

	private prepareErrorMessageAndCode(e: any): { message: string, code: number } {
		const hasResponse = hasOwnProperty(e, 'response');
		const errorJson = hasResponse && hasOwnProperty(e.response, 'body')
			? JSON.parse(e.response.body) : null;
		const message = errorJson && errorJson.code ? errorJson.code : e.message;
		const code = hasResponse && hasOwnProperty(e.response, 'statusCode') ? e.response.statusCode : null;

		return { message, code };
	}
}
