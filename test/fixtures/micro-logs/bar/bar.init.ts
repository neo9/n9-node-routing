import { N9Log } from '@neo9/n9-node-log';

export default async function(log: N9Log): Promise<void> {
	log.info('Hello bar.init');
	(global as any).log = log;
}
