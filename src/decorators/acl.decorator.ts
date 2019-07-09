import { AclPerm } from '../models/routes.models';
import * as RoutesService from '../routes.service';

export function Acl(perms: AclPerm[], loadPath?: string): MethodDecorator {
	return (target: object, methodName: string, descriptor: TypedPropertyDescriptor<any>) => {
		RoutesService.addRoute(target, methodName, descriptor, perms, loadPath);
	};
}
