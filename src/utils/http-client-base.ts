import { N9Log } from '@neo9/n9-node-log';
import { N9Error } from '@neo9/n9-node-utils';
import { getNamespace } from 'continuation-local-storage';
import { CoreOptions, Request, RequestAPI, RequiredUriUrl } from 'request';
import * as rpn from 'request-promise-native';
import * as UrlJoin from 'url-join';
import { RequestIdNamespaceName } from '../requestid';

export class N9HttpClient {
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

	public async request<T>(method: string, url: string | string[], queryParams?: object, headers: object = {}, body?: any): Promise<T> {
		const uri = this.getUriFromUrlParts(url);

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
			this.logger.error(`Error on [${method} ${uri}]`, { 'status': e.statusCode, 'response-time': (Date.now() - startTime) });
			const bodyJSON = JSON.stringify(body);
			// istanbul ignore else
			if (e.error) {
				throw new N9Error(e.error.code, e.statusCode, {
					uri,
					method,
					code: e.error.code,
					queryParams,
					headers,
					body: body && bodyJSON.length < this.maxBodyLengthToLogError ? bodyJSON : undefined,
					error: e.error,
					...e.error.context,
				});
			} else {
				throw e;
			}
		}
	}

	public async raw<T>(url: string | string[], options: CoreOptions): Promise<T> {
		const uri = this.getUriFromUrlParts(url);
		const startTime = Date.now();

		try {
			const res = await this.requestDefault(uri, options);

			return res.body as any;
		} catch (e) {
			this.logger.error(`Error on raw call [${options.method} ${uri}]`, { 'status': e.statusCode, 'response-time': (Date.now() - startTime) });
			// istanbul ignore else
			if (e.error) {
				let isOptionsStringable;
				try {
					JSON.stringify(options);
					isOptionsStringable = true;
				} catch (e) {
					isOptionsStringable = false;
				}

				throw new N9Error(e.error.code, e.statusCode, {
					uri,
					isOptionsStringable,
					options: isOptionsStringable ? options : undefined,
					error: e.error,
					...e.error.context,
				});			} else {
				throw e;
			}
		}
	}

	private getUriFromUrlParts(url: string | string[]): string {
		let uri;
		if (Array.isArray(url)) uri = UrlJoin(...url);
		else uri = UrlJoin(url);
		return uri;
	}
}
