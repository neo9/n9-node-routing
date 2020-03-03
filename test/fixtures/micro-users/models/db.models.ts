import { Expose } from 'class-transformer';
import { DateParser } from '../../../../src';

export class BaseMongoObject {
	public _id?: string;
	public objectInfos?: BaseMongoObjectInfos;
}

export class BaseMongoObjectInfosUpdate {
	@Expose()
	public userId: string;

	@Expose()
	@DateParser()
	public date: Date;
}

export class BaseMongoObjectInfosCreation extends BaseMongoObjectInfosUpdate {}

export class BaseMongoObjectInfos {
	@Expose()
	public creation: BaseMongoObjectInfosCreation;

	@Expose()
	public lastUpdate?: BaseMongoObjectInfosUpdate;
}
