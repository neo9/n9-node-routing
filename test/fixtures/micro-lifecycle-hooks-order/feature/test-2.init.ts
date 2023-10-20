import { N9Log } from '@neo9/n9-node-log';

export default (log: N9Log, conf: any): void => {
	log.info(`feature init 2 ${conf.name}`);
};
