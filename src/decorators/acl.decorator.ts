import { AclPerm } from '../models/routes.models';
import * as RoutesService from '../routes.service';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function Acl(perms: AclPerm[], loadPath?: string): MethodDecorator {
	return (object: object, methodName: string): void => {
		RoutesService.addRoute(object, methodName, perms, loadPath);
	};
}
