import * as ClassValidator from 'class-validator';

@ClassValidator.ValidatorConstraint({ name: 'isStringOrNumber', async: false })
export class IsStringOrNumber implements ClassValidator.ValidatorConstraintInterface {
	public validate(value: unknown): boolean {
		return ClassValidator.isString(value) || ClassValidator.isNumber(value);
	}

	public defaultMessage(): string {
		return 'Value should be a string or a number';
	}
}

export function isStringOrNumber(
	validatorOptions?: ClassValidator.ValidatorOptions,
): (object: object, propertyName: string) => void {
	return (object: object, propertyName: string): void => {
		ClassValidator.registerDecorator({
			propertyName,
			target: object.constructor,
			options: validatorOptions,
			constraints: [],
			validator: new IsStringOrNumber(),
		});
	};
}
