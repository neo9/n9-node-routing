export interface AclPerm {
	action: string;
	user?: string;
}

export interface Route {
	method: string;
	path: string | RegExp;
	acl: {
		perms: AclPerm[];
		loadPath: string;
	};
}
