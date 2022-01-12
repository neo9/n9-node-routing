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
		// eslint-disable-next-line no-bitwise
		const timestamp = ((new Date().getTime() / 1000) | 0).toString(16);
		return (
			timestamp +
			'xxxxxxxxxxxxxxxx'
				.replace(/[x]/g, () => {
					// eslint-disable-next-line no-bitwise
					return ((Math.random() * 16) | 0).toString(16);
				})
				.toLowerCase()
		);
	}
}
