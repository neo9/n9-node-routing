import { BaseMongoObject } from '@neo9/n9-mongodb-client';
import { Exclude, Expose } from 'class-transformer';

import { Allow, IsEmail, IsString, MinLength } from '../../../src';

export class UserRequestCreate {
	@IsString()
	@MinLength(2)
	@Allow()
	public firstName: string;

	@IsString()
	@MinLength(2)
	@Allow()
	public lastName: string;

	@IsString()
	@IsEmail()
	@Allow()
	public email: string;

	@IsString()
	@MinLength(8)
	@Allow()
	public password: string;

	@Allow()
	public someData: string[];
}

export class UserEntity extends BaseMongoObject {
	public firstName: string;
	public lastName: string;
	public email: string;
	public password: string;
	public someData: string[];
}

export class UserDetails extends UserEntity {
	@Exclude()
	public password: string;
}

@Exclude()
export class UserListItem extends BaseMongoObject {
	@Expose()
	public firstName: string;

	@Expose()
	public lastName: string;

	@Expose()
	public email: string;
}
