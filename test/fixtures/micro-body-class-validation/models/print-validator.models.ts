import { registerDecorator, ValidationOptions } from 'class-validator';

export function logValidator(validationOptions?: ValidationOptions): any {
	return (object: object, propertyName: string) => {
		registerDecorator({
			propertyName,
			name: 'logValidator',
			target: object.constructor,
			constraints: [],
			options: validationOptions,
			validator: {
				validate(value: any): boolean {
					// tslint:disable-next-line:no-console
					console.log(
						`Log Validator, propertyName : ${propertyName}, value : ${JSON.stringify(value)}`,
					);
					return true;
				},
			},
		});
	};
}
