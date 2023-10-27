import { join } from 'node:path';

import { N9Log } from '@neo9/n9-node-log';
import { glob } from 'glob';

export default async <ConfType>(
	path: string,
	log: N9Log,
	firstSequentialInitFileNames: string[] | undefined,
	conf: ConfType,
): Promise<any> => {
	const initFiles: string[] = await glob('**/*.init.+(ts|js)', { cwd: path });

	if (firstSequentialInitFileNames) {
		for (const firstSequentialInitFileName of firstSequentialInitFileNames) {
			const matchingInitFileIndex = initFiles.findIndex((initFile) =>
				initFile.includes(firstSequentialInitFileName),
			);
			if (matchingInitFileIndex !== -1) {
				const moduleName = initFiles[matchingInitFileIndex].split('/').slice(-2)[0];
				log.info(`Init module ${moduleName}`);
				// eslint-disable-next-line @typescript-eslint/no-var-requires,global-require,import/no-dynamic-require
				let module = require(join(path, initFiles[matchingInitFileIndex]));
				module = module.default ? module.default : module;
				await module(log, conf);
				log.debug(`End init module ${moduleName}`);
				initFiles.splice(matchingInitFileIndex, 1);
			}
		}
	}

	await Promise.all(
		initFiles.map(async (file) => {
			const moduleName = file.split('/').slice(-2)[0];
			try {
				log.info(`Init module ${moduleName}`);

				// eslint-disable-next-line @typescript-eslint/no-var-requires,global-require,import/no-dynamic-require
				let module = require(join(path, file));
				module = module.default ? module.default : module;
				await module(log, conf);
				log.debug(`End init module ${moduleName}`);
			} catch (e) {
				log.error(`Error while initializing ${moduleName}`, { errString: JSON.stringify(e) });
				throw e;
			}
		}),
	);
};
