import { FilterQuery, N9FindCursor, N9MongoDBClient } from '@neo9/n9-mongodb-client';
import type { Db } from '@neo9/n9-mongodb-client/mongodb';
import { N9Log } from '@neo9/n9-node-log';
import * as crypto from 'crypto';
import { Inject, Service } from 'typedi';

import { UserDetails, UserEntity, UserListItem, UserRequestCreate } from './users.models';

@Service()
export class UsersService {
	private static hashPassword(password: string): string {
		return crypto.createHash('sha256').update(password).digest('hex');
	}

	private mongoClient: N9MongoDBClient<UserEntity, UserListItem>;

	constructor(@Inject('db') db: Db, logger: N9Log) {
		this.mongoClient = new N9MongoDBClient('users', UserEntity, UserListItem, {
			db,
			logger,
			keepHistoric: true,
		});
	}

	public async getById(userId: string): Promise<UserDetails> {
		return await this.mongoClient.findOneById(userId);
	}

	public async existsByEmail(email: string): Promise<boolean> {
		return await this.mongoClient.existsByKey(email, 'email');
	}

	public find(
		query: FilterQuery<UserEntity>,
		page: number,
		size: number,
	): N9FindCursor<UserListItem> {
		return this.mongoClient.find(query, page, size);
	}

	public async create(user: UserRequestCreate, creatorUserId: string): Promise<UserDetails> {
		// Hash password
		user.password = UsersService.hashPassword(user.password);
		// Save to database
		return await this.mongoClient.insertOne(user, creatorUserId);
	}
}
