import { createNamespace, getNamespace } from 'cls-hooked';
import { NextFunction, Request, Response } from 'express';
import * as shortid from 'shortid';

// eslint-disable-next-line @typescript-eslint/naming-convention
const RequestIdNamespaceName = 'requestIdNamespace';
// eslint-disable-next-line @typescript-eslint/naming-convention
const RequestIdKey = 'request-id';
createNamespace(RequestIdNamespaceName);
export { RequestIdNamespaceName, RequestIdKey };

export function requestIdFilter(logObject: object & { message: string; level: string }): object {
	const formatLogInJSON: boolean = (global as any).n9NodeRoutingData?.formatLogInJSON ?? false;
	const message = logObject.message;

	const namespaceRequestId = getNamespace(RequestIdNamespaceName);
	const requestId = namespaceRequestId?.get(RequestIdKey);
	if (formatLogInJSON) {
		if (requestId) {
			return {
				requestId,
			};
		}
		return {};
	}
	return { message: requestId ? `(${requestId}) ${message}` : message };
}

export function setRequestContext(req: Request, res: Response, next: NextFunction): void {
	let requestId = req.headers['x-request-id'];
	if (!requestId) {
		requestId = shortid.generate();
	}
	const namespaceRequestId = getNamespace(RequestIdNamespaceName);
	namespaceRequestId.run(() => {
		namespaceRequestId.set(RequestIdKey, requestId);
		next();
	});
}
