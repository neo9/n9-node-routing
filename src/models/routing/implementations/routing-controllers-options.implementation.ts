import { RoutingControllersOptions as RoutingControllersOptionsInterface } from '@benjd90/routing-controllers';
import { AuthorizationChecker } from '@benjd90/routing-controllers/types/AuthorizationChecker';
import { CurrentUserChecker } from '@benjd90/routing-controllers/types/CurrentUserChecker';
import { Type } from 'class-transformer';
import {
	Allow,
	IsArray,
	IsBoolean,
	IsInt,
	IsOptional,
	IsString,
	ValidateNested,
	ValidatorOptions,
} from 'class-validator';
import { Class } from 'type-fest';

import { ClassTransformOptions } from './class-transform-options.implementation';

export class RoutingControllersOptionsDefaultsParamOptions {
	@IsOptional()
	@IsBoolean()
	required?: boolean;
}

export class RoutingControllersOptionsDefaults {
	@IsOptional()
	@IsInt()
	nullResultCode?: number;

	@IsOptional()
	@IsInt()
	undefinedResultCode?: number;

	@IsOptional()
	@ValidateNested()
	@Type(() => RoutingControllersOptionsDefaultsParamOptions)
	paramOptions?: RoutingControllersOptionsDefaultsParamOptions;
}

export class RoutingControllersOptions implements RoutingControllersOptionsInterface {
	@IsOptional()
	@Allow()
	cors?: boolean | object;

	@IsOptional()
	@IsString()
	routePrefix?: string;

	@IsOptional()
	@IsArray()
	controllers?: [] | string[];

	@IsOptional()
	@Allow()
	middlewares?: Class<unknown>[] | string[];

	@IsOptional()
	@Allow()
	interceptors?: Class<unknown>[] | string[];

	@IsOptional()
	@IsBoolean()
	classTransformer?: boolean;

	@IsOptional()
	@ValidateNested()
	@Type(() => ClassTransformOptions)
	classToPlainTransformOptions?: ClassTransformOptions;

	@IsOptional()
	@ValidateNested()
	@Type(() => ClassTransformOptions)
	plainToClassTransformOptions?: ClassTransformOptions;

	@IsOptional()
	@Allow()
	validation?: boolean | ValidatorOptions;

	@IsOptional()
	@IsBoolean()
	development?: boolean;

	@IsOptional()
	@IsBoolean()
	defaultErrorHandler?: boolean;

	@IsOptional()
	@Allow()
	errorOverridingMap?: {
		[key: string]: any;
	};

	@IsOptional()
	@Allow()
	authorizationChecker?: AuthorizationChecker;

	@IsOptional()
	@Allow()
	currentUserChecker?: CurrentUserChecker;

	@IsOptional()
	@ValidateNested()
	@Type(() => RoutingControllersOptions)
	defaults?: RoutingControllersOptionsDefaults;
}
