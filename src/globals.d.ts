/* tslint:disable:no-namespace */
declare namespace NodeJS {
	interface Global {
		conf: any;
		log: any;
		db: any;
		routes: {
			method: string;
			path: string | RegExp;
			acl: {
				perms: any; // AclPerm[]
				loadPath: string;
			}
		}[];
	}
}
