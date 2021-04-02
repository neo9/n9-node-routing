import { Exclude, Expose, Type } from 'class-transformer';
import {
	ArrayMinSize,
	IsArray,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	Matches,
	Min,
	ValidateNested,
	ValidatorConstraint,
} from 'class-validator';
import { IsString } from '../../../../src';
import { arrayValidator } from './array-validator.models';
import { logValidator } from './print-validator.models';

export enum UserType {
	BACK = 'back',
	FRONT = 'front',
	OTHER = 'other',
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
	// @Validate(ArrayValidator, { each: true }) Don't work for now, class-validator v 0.13.1
	@arrayValidator({ each: true })
	public anArray: string[] | UserFrontDetail[];
}

ValidatorConstraint({
	name: 'isRuleConditionGroupAllOrAnyOrConditionValidator',
	async: false,
});
