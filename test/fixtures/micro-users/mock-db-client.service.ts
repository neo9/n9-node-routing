import { customAlphabet } from 'nanoid';

import { BaseMongoObject } from './models/db.models';

export class MockDbClientService<E extends BaseMongoObject> {
	private collection: E[] = [];

	// eslint-disable-next-line @typescript-eslint/require-await
	public async insertOne(user: E, creatorUserId: string): Promise<E> {
		const createdItem = {
			...user,
			_id: this.generateObjectId(),
			objectInfos: {
				creation: {
					date: new Date(),
					userId: creatorUserId,
				},
			},
		};
		this.collection.push(createdItem);
		return createdItem;
	}

	public findOneByKey(value: string, key: string): E {
		return this.collection.find((elm) => elm[key] === value);
	}

	public findOneById(id: string): E {
		return this.findOneByKey(id, '_id');
	}

	private generateObjectId(): string {
		const nanoid = customAlphabet('0123456789abcdef', 24);
		return nanoid();
	}
}
