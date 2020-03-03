import * as crypto from 'crypto';
import { Service } from 'typedi';
import { MockDbClientService } from './mock-db-client.service';
import { User } from './models/users.models';

@Service()
export class UsersService {
	private static async hashPassword(password: string): Promise<string> {
		const hasher = crypto.createHash('sha256');
		await hasher.update(password);
		return hasher.digest('hex');
	}
	private mongoClient: MockDbClientService<User>;

	constructor() {
		this.mongoClient = new MockDbClientService();
	}

	public async getById(userId: string): Promise<User> {
		return await this.mongoClient.findOneById(userId);
	}

	public async getByEmail(email: string): Promise<User> {
		return await this.mongoClient.findOneByKey(email, 'email');
	}

	public async create(user: User, creatorUserId: string): Promise<User> {
		// Hash password
		user.password = await UsersService.hashPassword(user.password);
		// Add date creation
		user.createdAt = new Date();
		// Save to database
		return await this.mongoClient.insertOne(user, creatorUserId);
	}
}
