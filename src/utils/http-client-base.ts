import { N9Log } from '@neo9/n9-node-log';
import { N9Error } from '@neo9/n9-node-utils';
import { getNamespace } from 'continuation-local-storage';
import { CoreOptions, Request, RequestAPI, RequiredUriUrl } from 'request';
import * as rpn from 'request-promise-native';
import * as UrlJoin from 'url-join';
import { RequestIdNamespaceName } from '../requestid';

export class N9HttpClient {
	private readonly requestDefault: RequestAPI<Request, CoreOptions, RequiredUriUrl>;

	constructor(private readonly logger: N9Log = global.log, options?: CoreOptions) {
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

	public async post<T>(url: string | string[], queryParams?: object, headers: object = {}): Promise<T> {
		return this.request<T>('post', url, queryParams, headers);
	}

	public async put<T>(url: string | string[], queryParams?: object, headers: object = {}): Promise<T> {
		return this.request<T>('put', url, queryParams, headers);
	}

	public async delete<T>(url: string | string[], queryParams?: object, headers: object = {}): Promise<T> {
		return this.request<T>('delete', url, queryParams, headers);
	}

	public async options<T>(url: string | string[], queryParams?: object, headers: object = {}): Promise<T> {
		return this.request<T>('options', url, queryParams, headers);
	}

	public async patch<T>(url: string | string[], queryParams?: object, headers: object = {}): Promise<T> {
		return this.request<T>('patch', url, queryParams, headers);
	}

	public async request<T>(method: string, url: string | string[], queryParams?: object, headers: object = {}): Promise<T> {
		const uri = this.getUriFromUrlParts(url);

		const namespaceRequestId = getNamespace(RequestIdNamespaceName);
		const requestId = namespaceRequestId && namespaceRequestId.get('request-id');
		const sentHeaders = Object.assign({}, headers, { 'x-request-id': requestId });

		try {
			const res = await this.requestDefault({
				method,
				uri,
				qs: queryParams,
				headers,
			});

			return res.body as any;
		} catch (e) {
			this.logger.error(`Error on [${method} ${uri}]`, e);
			// istanbul ignore else
			if (e.error) {
				throw new N9Error(e.error.code, e.statusCode);
			} else {
				throw e;
			}
		}
	}

	public async raw<T>(url: string | string[], options: CoreOptions): Promise<T> {
		const uri = this.getUriFromUrlParts(url);

		try {
			const res = await this.requestDefault(uri, options);

			return res.body as any;
		} catch (e) {
			this.logger.error(`Error on raw call [${options.method} ${uri}]`, e);
			// istanbul ignore else
			if (e.error) {
				throw new N9Error(e.error.code, e.statusCode);
			} else {
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
