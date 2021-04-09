import {
	registerDecorator,
	validateSync,
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';
import * as _ from 'lodash';
import { UserFrontDetail } from './users.models';

@ValidatorConstraint({ name: 'arrayValidator', async: false })
export class ArrayValidator implements ValidatorConstraintInterface {
	public validate(
		value: string | UserFrontDetail,
		validationArguments?: ValidationArguments,
	): boolean {
		if (_.isString(value)) return true;
		if (value instanceof UserFrontDetail) {
			const errors = validateSync(value);
			return !!errors?.length;
		}

		return false;
	}

	public defaultMessage(validationArguments?: ValidationArguments): string {
		return `${validationArguments.property} must be string | UserFrontDetail`;
	}
}
export function arrayValidator(validationOptions?: ValidationOptions): any {
	return (object: object, propertyName: string) => {
		registerDecorator({
			propertyName,
			name: 'arrayValidator',
			target: object.constructor,
			constraints: [],
			options: validationOptions,
			validator: new ArrayValidator(),
		});
	};
}
