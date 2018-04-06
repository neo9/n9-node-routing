import { getMetadataArgsStorage } from 'routing-controllers';

interface Perm {
	action: string,
	user?: string
}

export function Acl(perms: Perm[], loadPath?: string): Function {
	return function (object: Object, methodName: string) {
		const act = getMetadataArgsStorage().actions.filter((action) => {
			return action.target === object.constructor && action.method === methodName;
		})[0];

		global.routes.push({
			method: act.type,
			path: act.route,
			acl: {
				perms,
				loadPath
			}
		});
	};
}