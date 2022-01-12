import { N9Log } from '@neo9/n9-node-log';

export default (log: N9Log): void => {
	log.info('Hello bar.init');
	(global as any).log = log;
};
