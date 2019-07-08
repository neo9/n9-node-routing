import { BaseMongoObject } from './models/db.models';

export class MockDbClientService<E extends BaseMongoObject> {

	private collection: E[] = [];

	public async insertOne(user: E, creatorUserId: string): Promise<E> {
		let createdItem = {
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

	private generateObjectId(): string {
		const timestamp = (new Date().getTime() / 1000 | 0).toString(16);
		return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => {
			return (Math.random() * 16 | 0).toString(16);
		}).toLowerCase();
	};

	findOneByKey(value: string, key: string) {
		return this.collection.find((elm) => elm[key] === value);
	}

	findOneById(id: string) {
		return this.findOneByKey(id, '_id');
	}
}