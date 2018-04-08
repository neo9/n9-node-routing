import {registerDecorator, ValidationOptions, ValidationArguments} from "class-validator";
import * as moment from 'moment';

export function DateParser(dateFormat?: string, validationOptions?: ValidationOptions) {
	return function (object: Object, propertyName: string) {
		registerDecorator({
			name: "DateParser",
			target: object.constructor,
			propertyName: propertyName,
			constraints: [dateFormat],
			options: validationOptions,
			validator: {
				validate(value: any, args: ValidationArguments) {
					const [dateFormat] = args.constraints;
					(args.object as any)[propertyName] = moment(value, dateFormat).toDate();
					return  true;
				}
			}
		});
	};
}
