import * as crypto from 'crypto';
import { Service } from 'typedi';

import { MockDbClientService } from './mock-db-client.service';
import { User } from './models/users.models';

@Service()
export class UsersService {
	private static hashPassword(password: string): string {
		const hasher = crypto.createHash('sha256');
		hasher.update(password);
		return hasher.digest('hex');
	}
	private mongoClient: MockDbClientService<User>;

	constructor() {
		this.mongoClient = new MockDbClientService();
	}

	public getById(userId: string): User {
		return this.mongoClient.findOneById(userId);
	}

	public getByEmail(email: string): User {
		return this.mongoClient.findOneByKey(email, 'email');
	}

	public async create(user: User, creatorUserId: string): Promise<User> {
		// Hash password
		user.password = UsersService.hashPassword(user.password);
		// Add date creation
		user.createdAt = new Date();
		// Save to database
		return await this.mongoClient.insertOne(user, creatorUserId);
	}
}
