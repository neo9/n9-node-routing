import { getMetadataArgsStorage } from 'routing-controllers';
import { AclPerm } from '../models/routes.models';
import * as RoutesService from '../routes.service';

export function Acl(perms: AclPerm[], loadPath?: string): MethodDecorator {
	return (object: object, methodName: string) => {
		RoutesService.addRoute(object, methodName, perms, loadPath);
	};
}
