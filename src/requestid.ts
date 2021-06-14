import { createNamespace, getNamespace } from 'cls-hooked';
import { NextFunction, Request, Response } from 'express';
import * as shortid from 'shortid';

const RequestIdNamespaceName = 'requestIdNamespace';
const RequestIdKey = 'request-id';
createNamespace(RequestIdNamespaceName);
export { RequestIdNamespaceName, RequestIdKey };

function flattenWithInheritProperties(obj: object): object {
	if (!obj) return obj;

	const result = Object.create(obj);
	Object.getOwnPropertyNames(obj).forEach((key) => {
		result[key] = result[key];
	});
	return result;
}

export function requestIdFilter(
	level: string,
	msg: string,
	meta: any,
): string | { msg: any; meta: any } {
	const formatLogInJSON: boolean = (global as any).n9NodeRoutingData?.formatLogInJSON ?? false;

	const namespaceRequestId = getNamespace(RequestIdNamespaceName);
	const requestId = namespaceRequestId?.get(RequestIdKey);
	if (formatLogInJSON) {
		const metaFull = flattenWithInheritProperties(meta);
		return {
			msg,
			meta: {
				...metaFull,
				requestId,
			},
		};
	}
	return requestId ? `(${requestId}) ${msg}` : msg;
}

export function setRequestContext(req: Request, res: Response, next: NextFunction): void {
	let requestId = req.headers['x-request-id'];
	if (!requestId) {
		requestId = shortid.generate();
	}
	const namespaceRequestId = getNamespace(RequestIdNamespaceName);
	namespaceRequestId.run(async () => {
		namespaceRequestId.set(RequestIdKey, requestId);
		next();
	});
}
