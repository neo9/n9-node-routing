import { AclPerm, Route } from './models/routes.models';

const aclDescriptions: object[] = [];

function addRoute(object: object, methodName: string, perms: AclPerm[], loadPath?: string): void {
	aclDescriptions.push({
		object,
		methodName,
		perms,
		loadPath
	});
}

function getRoutes(): Route[] {
	// const ret = aclDescriptions.map((d: any) => {
	// 	return {
	// 		method: act.type,
	// 		path: controllerRoutePrefix + actRoute,
	// 		acl: {
	// 			perms: d.perms,
	// 			loadPath: d.loadPath
	// 		}
	// 	};
	// });
	//
	// return ret;
	// TODO: implement route listing
	return [];
}

export {
	addRoute,
	getRoutes
};
