import { N9Log } from '@neo9/n9-node-log';
import { N9Error } from '@neo9/n9-node-utils';
import { getNamespace } from 'continuation-local-storage';
import { IncomingMessage } from 'http';
import { CoreOptions, Request, RequestAPI, RequiredUriUrl } from 'request';
import * as rpn from 'request-promise-native';
import { PassThrough } from 'stream';
import { RequestIdNamespaceName } from '../requestid';
import UrlJoin = require('url-join');
import stringify from 'fast-safe-stringify';
import request = require('request');

export class N9HttpClient {

	private static getUriFromUrlParts(url: string | string[]): string {
		let uri;
		if (Array.isArray(url)) uri = UrlJoin(...url);
		else uri = UrlJoin(url);
		return uri;
	}

	private readonly requestDefault: RequestAPI<Request, CoreOptions, RequiredUriUrl>;

	constructor(private readonly logger: N9Log = global.log, options?: CoreOptions, private maxBodyLengthToLogError: number = 100) {
		this.requestDefault = rpn.defaults(Object.assign({}, options, {
			useQuerystring: true,
			json: true,
			resolveWithFullResponse: true,
			gzip: true,
		}));
	}

	/**
	 * QueryParams samples : https://github.com/request/request/blob/master/tests/test-qs.js
	 */
	public async get<T>(url: string | string[], queryParams?: object, headers: object = {}): Promise<T> {
		return this.request<T>('get', url, queryParams, headers);
	}

	public async post<T>(url: string | string[], body?: any, queryParams?: object, headers: object = {}): Promise<T> {
		return this.request<T>('post', url, queryParams, headers, body);
	}

	public async put<T>(url: string | string[], body?: any, queryParams?: object, headers: object = {}): Promise<T> {
		return this.request<T>('put', url, queryParams, headers, body);
	}

	public async delete<T>(url: string | string[], body?: any, queryParams?: object, headers: object = {}): Promise<T> {
		return this.request<T>('delete', url, queryParams, headers, body);
	}

	public async options<T>(url: string | string[], queryParams?: object, headers: object = {}): Promise<T> {
		return this.request<T>('options', url, queryParams, headers);
	}

	public async patch<T>(url: string | string[], body?: any, queryParams?: object, headers: object = {}): Promise<T> {
		return this.request<T>('patch', url, queryParams, headers, body);
	}

	public async head(url: string | string[], queryParams?: object, headers: object = {}): Promise<void> {
		return this.request<void>('head', url, queryParams, headers);
	}

	public async request<T>(method: string, url: string | string[], queryParams?: object, headers: object = {}, body?: any): Promise<T> {
		const uri = N9HttpClient.getUriFromUrlParts(url);

		const namespaceRequestId = getNamespace(RequestIdNamespaceName);
		const requestId = namespaceRequestId && namespaceRequestId.get('request-id');
		const sentHeaders = Object.assign({}, headers, { 'x-request-id': requestId });
		const startTime = Date.now();

		try {
			const res = await this.requestDefault({
				method,
				uri,
				qs: queryParams,
				headers: sentHeaders,
				body,
			});

			return res.body as any;
		} catch (e) {
			const responseTime = Date.now() - startTime;
			this.logger.error(`Error on [${method} ${uri}]`, { 'status': e.statusCode, 'response-time': responseTime });
			const bodyJSON = stringify(body);
			// istanbul ignore else
			if (e.error) {
				throw new N9Error(e.error.code, e.statusCode, {
					uri,
					method,
					code: e.error.code,
					queryParams,
					headers,
					body: body && bodyJSON.length < this.maxBodyLengthToLogError ? bodyJSON : undefined,
					srcError: stringify(e.error),
					responseTime,
				});
			} else {
				throw e;
			}
		}
	}

	public async raw<T>(url: string | string[], options: CoreOptions): Promise<T> {
		const uri = N9HttpClient.getUriFromUrlParts(url);
		const startTime = Date.now();

		try {
			const res = await this.requestDefault(uri, options);

			return res.body as any;
		} catch (e) {
			this.logger.error(`Error on raw call [${options.method} ${uri}]`, { 'status': e.statusCode, 'response-time': (Date.now() - startTime) });
			// istanbul ignore else
			if (e.error) {
				throw new N9Error(e.error.code, e.statusCode, {
					uri,
					options: stringify(options),
					error: e.error,
					...e.error.context,
				});
			} else {
				throw e;
			}
		}
	}

	public async requestStream(url: string | string[], options?: CoreOptions): Promise<{ incomingMessage: IncomingMessage, responseAsStream: PassThrough }> {
		const responseAsStream = new PassThrough();
		const startTime = Date.now();
		const uri = N9HttpClient.getUriFromUrlParts(url);
		const requestResponse = await request(uri, options);
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
			this.logger.error('Error while calling URL', { url });
			const durationCatch = Date.now() - startTime;
			this.logger.debug(`File TTFB : ${durationCatch} ms`, { durationMs: durationCatch, statusCode: e.statusCode, url });
			throw new N9Error((e.error && e.error.code) || e.message || e.name || 'unknown-error', e.statusCode, {
				uri,
				method: options && options.method,
				code: e.error && e.error.code,
				headers: options && options.headers,
				srcError: stringify(e.error),
				responseTime: durationCatch,
			});
		}
		durationMsTTFB = Date.now() - startTime;
		this.logger.debug(`File TTFB : ${durationMsTTFB} ms`, { durationMs: durationMsTTFB, statusCode: incomingMessage.statusCode, url });
		return { incomingMessage, responseAsStream };
	}
}
