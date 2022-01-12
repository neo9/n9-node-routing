import { Exclude, Expose, Type } from 'class-transformer';
import {
	ArrayMinSize,
	IsArray,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	Matches,
	Min,
	Validate,
	ValidateNested,
	ValidatorConstraint,
} from 'class-validator';

import { IsString } from '../../../../src';
import { ArrayValidator } from './array-validator.models';
import { logValidator } from './print-validator.models';

export enum UserType {
	BACK = 'back',
	FRONT = 'front',
	OTHER = 'other',
}

export abstract class UserDetail {}

export class UserBackDetail {
	@IsString()
	@Matches('^[0-9a-z]+$')
	public role: string;
}

@Exclude()
export class UserFrontDetail {
	@Expose()
	@IsNumber()
	@Min(5)
	@logValidator()
	public ageInYears: number;
}

@Exclude()
export class UserOtherDetail {
	@Expose()
	@IsArray()
	@ArrayMinSize(1)
	@Validate(ArrayValidator, { each: true })
	// @arrayValidator({ each: true }) // both annotation works
	public anArray: string[] | UserFrontDetail[];
}

@Exclude()
export class User<T extends UserDetail> {
	@IsString()
	@IsEnum(UserType)
	@Expose()
	public type: UserType;

	@Expose()
	@logValidator()
	@Type((type) => {
		const key = type.object.type as UserType;
		switch (key) {
			case UserType.BACK:
				return UserBackDetail;
			case UserType.FRONT:
				return UserFrontDetail;
			case UserType.OTHER:
				return UserOtherDetail;
			default:
				// eslint-disable-next-line no-throw-literal,rxjs/throw-error
				throw {
					message: 'unknown-user-type',
					status: 400,
					context: { object: type.object },
				};
		}
	})
	@IsNotEmpty()
	@ValidateNested()
	public details: T;
}

ValidatorConstraint({
	name: 'isRuleConditionGroupAllOrAnyOrConditionValidator',
	async: false,
});
