import { FilterQuery, MongoClient, N9FindCursor } from '@neo9/n9-mongodb-client';
import * as crypto from 'crypto';
import { Service } from 'typedi';

import { UserDetails, UserEntity, UserListItem, UserRequestCreate } from './users.models';

@Service()
export class UsersService {
	private static hashPassword(password: string): string {
		const hasher = crypto.createHash('sha256');
		hasher.update(password);
		return hasher.digest('hex');
	}

	private mongoClient: MongoClient<UserEntity, UserListItem>;

	constructor() {
		this.mongoClient = new MongoClient('users', UserEntity, UserListItem, {
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
