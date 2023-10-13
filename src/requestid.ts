import { N9Log } from '@neo9/n9-node-log';
import { createNamespace, getNamespace } from 'cls-hooked';
import { NextFunction, Request, Response } from 'express';
import { nanoid } from 'nanoid';

// eslint-disable-next-line @typescript-eslint/naming-convention
const RequestIdNamespaceName = 'requestIdNamespace';
// eslint-disable-next-line @typescript-eslint/naming-convention
const RequestIdKey = 'request-id';
createNamespace(RequestIdNamespaceName);
export { RequestIdNamespaceName, RequestIdKey };

export function requestIdFilter({ message, context, options }: N9Log.FilterParameter): {
	message?: string;
	context?: object;
} {
	const formatLogInJSON: boolean = options.formatJSON ?? false;

	const namespaceRequestId = getNamespace(RequestIdNamespaceName);
	const requestId = namespaceRequestId?.get(RequestIdKey);
	if (formatLogInJSON) {
		if (requestId) {
			return {
				context: {
					requestId,
					...context,
				},
			};
		}
	}
	return { message: requestId ? `(${requestId}) ${message}` : message };
}

export function setRequestContext(req: Request, res: Response, next: NextFunction): void {
	let requestId = req.headers['x-request-id'];
	if (!requestId) {
		requestId = nanoid(10);
	}
	const namespaceRequestId = getNamespace(RequestIdNamespaceName);
	namespaceRequestId.run(() => {
		namespaceRequestId.set(RequestIdKey, requestId);
		next();
	});
}
