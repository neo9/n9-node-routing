import { join } from 'node:path';

import { N9Log } from '@neo9/n9-node-log';
import * as fg from 'fast-glob';

export default async <ConfType>(
	path: string,
	log: N9Log,
	firstSequentialFileNames: string[] | undefined,
	conf: ConfType,
	type: 'init' | 'started',
): Promise<any> => {
	const filesToRun: string[] = await fg.glob(`**/*.${type}.+(ts|js)`, { cwd: path });

	if (firstSequentialFileNames) {
		for (const firstSequentialFileName of firstSequentialFileNames) {
			const matchingFileIndex = filesToRun.findIndex((initFile) =>
				initFile.includes(firstSequentialFileName),
			);
			if (matchingFileIndex !== -1) {
				const moduleName = filesToRun[matchingFileIndex].split('/').slice(-2)[0];
				log.info(`Run ${type} module ${moduleName}`);
				// eslint-disable-next-line @typescript-eslint/no-var-requires,global-require,import/no-dynamic-require
				let module = require(join(path, filesToRun[matchingFileIndex]));
				module = module.default ? module.default : module;
				await module(log.module(moduleName), conf);
				log.debug(`End running ${type} module ${moduleName}`);
				filesToRun.splice(matchingFileIndex, 1);
			}
		}
	}

	await Promise.all(
		filesToRun.map(async (file) => {
			const moduleName = file.split('/').slice(-2)[0];
			try {
				log.info(`Run ${type} module ${moduleName}`);

				// eslint-disable-next-line @typescript-eslint/no-var-requires,global-require,import/no-dynamic-require
				let module = require(join(path, file));
				module = module.default ? module.default : module;
				await module(log.module(moduleName), conf);
				log.debug(`End running ${type} module ${moduleName}`);
			} catch (e) {
				log.error(`Error while initializing ${moduleName}`, { errString: JSON.stringify(e) });
				throw e;
			}
		}),
	);
};
