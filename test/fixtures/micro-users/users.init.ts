import { N9Log } from '@neo9/n9-node-log';

export default async (log: N9Log) => {
	log.module('users').info('Ensuring email unique index');
	// create index in collection for instance
};
