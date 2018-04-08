// import { Db, Collection } from 'mongodb';

import { N9Log } from '@neo9/n9-node-log';
import { N9Error } from '@neo9/n9-node-utils';

export default async (log: N9Log) => {
	log = log.module('users');

	log.info('Ensuring post unique index');

	// const users: Collection = global.db.collection('users');
	// await users.createIndex({ email: 1 }, { unique: true });
}