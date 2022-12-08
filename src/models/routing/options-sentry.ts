// eslint-disable-next-line max-classes-per-file
import { RequestHandlerOptions } from '@sentry/node/dist/handlers';
import { Type } from 'class-transformer';
import {
	Allow,
	IsArray,
	IsBoolean,
	IsIn,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator';

import { isStringOrNumber } from '../../validators/string-or-number.validator';
import { NodeOptions } from './implementations/sentry-node-options.implementation';

export class MiddlewareErrorOutput {
	@IsOptional()
	@isStringOrNumber()
	statusCode?: number | string;
}

export class SentryIntegrationOption {
	@IsString()
	kind: string;
}

/**
 * Model of errors from Sentry
 */
export class MiddlewareError extends Error {
	@IsOptional()
	@isStringOrNumber()
	status?: number | string;

	@IsOptional()
	@isStringOrNumber()
	statusCode?: number | string;

	@IsOptional()
	@isStringOrNumber()
	// eslint-disable-next-line @typescript-eslint/naming-convention
	status_code?: number | string;

	@IsOptional()
	@ValidateNested()
	@Type(() => MiddlewareErrorOutput)
	output?: MiddlewareErrorOutput;
}

export class SentryIntegrationTracingOptionMethods {
	@IsOptional()
	@IsArray()
	@IsString()
	@IsIn(['all', 'get', 'head', 'post', 'put', 'delete', 'options', 'trace', 'patch'])
	methods?: ('all' | 'get' | 'head' | 'post' | 'put' | 'delete' | 'options' | 'trace' | 'patch')[];
}

export class SentryIntegrationTracingOption extends SentryIntegrationOption {
	@IsString()
	@IsIn(['tracing'])
	kind: 'tracing';

	@IsOptional()
	@ValidateNested()
	@Type(() => SentryIntegrationTracingOptionMethods)
	options?: SentryIntegrationTracingOptionMethods;
}

export class SentryErrorHandlerOptions {
	// No validation because it should be in the conf but passed to the constructor as an option
	shouldHandleError?: (error: MiddlewareError) => boolean;
}

export class SentryOptions {
	@IsOptional()
	@ValidateNested()
	@Type(() => NodeOptions)
	initOptions?: NodeOptions; // dsn can be provided through env variable

	@IsOptional()
	@IsBoolean()
	forceCustomOptions?: boolean;

	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => SentryIntegrationTracingOption)
	additionalIntegrations?: SentryIntegrationTracingOption[];

	@IsOptional()
	@Allow()
	requestHandlerOptions?: RequestHandlerOptions;

	@IsOptional()
	@ValidateNested()
	@Type(() => SentryErrorHandlerOptions)
	errorHandlerOptions?: SentryErrorHandlerOptions;
}
