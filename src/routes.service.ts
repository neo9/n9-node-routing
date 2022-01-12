import { getMetadataArgsStorage } from '@benjd90/routing-controllers';

import { AclPerm, Route } from './models/routes.models';

const aclDescriptions: object[] = [];

function addRoute(object: object, methodName: string, perms: AclPerm[], loadPath?: string): void {
	aclDescriptions.push({
		object,
		methodName,
		perms,
		loadPath,
	});
}

function getRoutes(): Route[] {
	return aclDescriptions.map((d: any) => {
		const act = getMetadataArgsStorage().actions.filter((action) => {
			return action.target === d.object.constructor && action.method === d.methodName;
		})[0];

		const controller = getMetadataArgsStorage().controllers.filter((ctrl) => {
			return ctrl.target === d.object.constructor;
		});

		let controllerRoutePrefix = '';
		if (controller?.[0]?.route) {
			controllerRoutePrefix = controller[0].route;
		}

		let actRoute = '';
		if (act.route) {
			actRoute = act.route.toString();
		}

		return {
			method: act.type,
			path: controllerRoutePrefix + actRoute,
			acl: {
				perms: d.perms,
				loadPath: d.loadPath,
			},
		};
	});
}

export { addRoute, getRoutes };
