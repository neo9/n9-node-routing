import { N9Log } from '@neo9/n9-node-log';
import { Type } from 'class-transformer';
import {
	Allow,
	IsArray,
	IsBoolean,
	IsNumber,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator';

export type CallbacksBeforeShutdownFunction = (log: N9Log) => Promise<void>;

export class CallbacksBeforeShutdown {
	// No validation because it should be in the conf but passed to the constructor as an option
	function: CallbacksBeforeShutdownFunction;

	@Allow()
	thisArg: any;

	@IsOptional()
	@IsString()
	name?: string;
}

export class ShutdownOptions {
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CallbacksBeforeShutdown)
	callbacksBeforeShutdown?: CallbacksBeforeShutdown[];

	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CallbacksBeforeShutdown)
	callbacksBeforeShutdownAfterExpressEnded?: CallbacksBeforeShutdown[];

	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CallbacksBeforeShutdown)
	callbacksOnShutdownSignalReceived?: CallbacksBeforeShutdown[];

	@IsOptional()
	@IsNumber()
	waitDurationBeforeStop?: number;

	@IsOptional()
	@IsBoolean()
	enableGracefulShutdown?: boolean;

	@IsOptional()
	@IsNumber()
	timeout?: number;
}
