import { N9Log } from '@neo9/n9-node-log';
import * as glob from 'glob-promise';
import { join } from 'path';

export default async function(path: string, log: N9Log): Promise<any> {
	const initFiles = await glob('**/*.init.+(ts|js)', { cwd: path });

	await Promise.all(
		initFiles.map((file) => {
			const moduleName = file.split('/').slice(-2)[0];
			log.info(`Init module ${moduleName}`);

			let module = require(join(path, file));
			module = module.default ? module.default : module;
			return module(log);
		}),
	);
}
