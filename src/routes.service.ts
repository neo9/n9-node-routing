import { N9Error } from '@neo9/n9-node-utils';
import { PATH_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import { AclPerm, Route } from './models/routes.models';
import UrlJoin = require('url-join');
import { RequestMethod } from '@nestjs/common';

const aclDescriptions: {
	object: object;
	methodName: string;
	descriptor: TypedPropertyDescriptor<any>;
	perms: AclPerm[];
	loadPath?: string;
}[] = [];
let controllersRoutes: { name: string; data: string; path: string }[];

function getControllersRoutes(nestApplicationModule: any): { name: string; data: string; path: string }[] {
	if (controllersRoutes) return controllersRoutes;

	// TODO: add recursive seek to find all controllers in sub modules too
	controllersRoutes = [];
	const controllers = Reflect.getOwnMetadata('controllers', nestApplicationModule);
	for (const controller of controllers) {
		const controllerPath: string = Reflect.getMetadata(PATH_METADATA, controller);
		controllersRoutes.push({
			name: controller.name,
			data: controller.toString(), // controller class as string is made of class code
			path: controllerPath,
		});
	}
	return controllersRoutes;
}

function addRoute(object: object, methodName: string, descriptor: TypedPropertyDescriptor<any>, perms: AclPerm[], loadPath?: string): void {
	aclDescriptions.push({
		object,
		methodName,
		descriptor,
		perms,
		loadPath,
	});
}

function mapNestMethodToHttpName(requestMethod: RequestMethod): string {
	switch (requestMethod) {
		case RequestMethod.GET:
			return 'get';
		case RequestMethod.POST:
			return 'post';
		case RequestMethod.ALL:
			return 'use';
		case RequestMethod.DELETE:
			return 'delete';
		case RequestMethod.PUT:
			return 'put';
		case RequestMethod.PATCH:
			return 'patch';
		case RequestMethod.OPTIONS:
			return 'options';
		case RequestMethod.HEAD:
			return 'head';
		default:
			throw new N9Error('unknown-http-method', 400, { requestMethod });
	}
}

function removeLastSlash(path: string): string {
	if (path[path.length - 1] === '/') {
		return path.substr(0, path.length - 1);
	} else {
		return path;
	}
}

function getRoutes(nestApplicationModule: any): Route[] {
	const localControllersRoutes = getControllersRoutes(nestApplicationModule);

	return aclDescriptions.map((aclDescription: any) => {
		const actPath = Reflect.getMetadata(PATH_METADATA, aclDescription.descriptor.value);
		const actMethod = mapNestMethodToHttpName(Reflect.getMetadata(METHOD_METADATA, aclDescription.descriptor.value));
		const controllerRoute = localControllersRoutes.find((controllerBaseRoute) => controllerBaseRoute.data === aclDescription.object.constructor.toString());

		let controllerRoutePrefix;
		if (!controllerRoute) {
			controllerRoutePrefix = '';
		} else {
			controllerRoutePrefix = controllerRoute.path;
		}

		return {
			method: actMethod,
			path: removeLastSlash(UrlJoin(controllerRoutePrefix, actPath)),
			acl: {
				perms: aclDescription.perms,
				loadPath: aclDescription.loadPath,
			},
		};
	});
}

export {
	addRoute,
	getRoutes,
};
