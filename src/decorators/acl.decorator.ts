import { getMetadataArgsStorage } from 'routing-controllers';
import { AclPerm } from '../models/routes.models';
import * as RoutesService from '../routes.service';

export function Acl(perms: AclPerm[], loadPath?: string): MethodDecorator {
	return (object: object, methodName: string) => {
		const act = getMetadataArgsStorage().actions.filter((action) => {
			return action.target === object.constructor && action.method === methodName;
		})[0];

		RoutesService.addRoute({
			method: act.type,
			path: act.route,
			acl: {
				perms,
				loadPath
			}
		});
	};
}
