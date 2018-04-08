import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";
import * as moment from 'moment';

export function DateParser(dateFormat?: string, validationOptions?: ValidationOptions): PropertyDecorator {
	return (object: object, propertyName: string) => {
		registerDecorator({
			name: "DateParser",
			target: object.constructor,
			propertyName,
			constraints: [dateFormat],
			options: validationOptions,
			validator: {
				validate(value: any, args: ValidationArguments): boolean {
					const [dateFormat2] = args.constraints;
					(args.object as any)[propertyName] = moment(value, dateFormat2).toDate();
					return true;
				}
			}
		});
	};
}
