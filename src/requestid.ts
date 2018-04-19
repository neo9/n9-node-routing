import { N9Log } from '@neo9/n9-node-log';
import { waitFor } from '@neo9/n9-node-utils';
import { createNamespace, getNamespace } from 'continuation-local-storage';
import { NextFunction, Request, Response } from 'express';
import * as shortid from 'shortid';

const requestIdNamespaceName = 'requestIdNamespace';
const requestIdNamespace = createNamespace(requestIdNamespaceName);

export function requestIdFilter(level: string, msg: string, meta: any): string {
	const namespace = getNamespace(requestIdNamespaceName);
	return namespace && namespace.get('requestId') ? `(${namespace.get('requestId')}) ${msg}` : msg;
}

export function setRequestContext(req: Request, res: Response, next: NextFunction): void {
	requestIdNamespace.run(() => {
		if (!req.headers.requestId) {
			req.headers.requestId = shortid.generate();
		}
		requestIdNamespace.set('requestId', req.headers.requestId);
		next();
	});
}
