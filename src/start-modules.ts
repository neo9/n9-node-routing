import { join } from 'node:path';

import { N9Log } from '@neo9/n9-node-log';
import { glob } from 'glob';

export default async <ConfType>(
	path: string,
	log: N9Log,
	firstSequentialStartFileNames: string[] | undefined,
	conf: ConfType,
): Promise<any> => {
	const initFiles: string[] = await glob('**/*.started.+(ts|js)', { cwd: path });

	if (firstSequentialStartFileNames) {
		for (const firstSequentialStartFileName of firstSequentialStartFileNames) {
			const matchingStartFileIndex = initFiles.findIndex((initFile) =>
				initFile.includes(firstSequentialStartFileName),
			);
			if (matchingStartFileIndex !== -1) {
				const moduleName = initFiles[matchingStartFileIndex].split('/').slice(-2)[0];
				log.info(`Init started module ${moduleName}`);
				// eslint-disable-next-line @typescript-eslint/no-var-requires,global-require,import/no-dynamic-require
				let module = require(join(path, initFiles[matchingStartFileIndex]));
				module = module.default ? module.default : module;
				await module(log, conf);
				log.debug(`End started module ${moduleName}`);
				initFiles.splice(matchingStartFileIndex, 1);
			}
		}
	}

	await Promise.all(
		initFiles.map(async (file) => {
			const moduleName = file.split('/').slice(-2)[0];
			try {
				log.info(`Init started module ${moduleName}`);

				// eslint-disable-next-line @typescript-eslint/no-var-requires,global-require,import/no-dynamic-require
				let module = require(join(path, file));
				module = module.default ? module.default : module;
				await module(log, conf);
				log.debug(`End init started module ${moduleName}`);
			} catch (e) {
				log.error(`Error while initializing ${moduleName}`, { errString: JSON.stringify(e) });
				throw e;
			}
		}),
	);
};
