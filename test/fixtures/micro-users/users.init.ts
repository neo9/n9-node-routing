import { N9Log } from '@neo9/n9-node-log';

export default (log: N9Log): void => {
	log.module('users').info('Ensuring email unique index');
	// create index in collection for instance
};
