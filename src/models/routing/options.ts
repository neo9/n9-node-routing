import { N9Log } from '@neo9/n9-node-log';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';

import { N9NodeRoutingBaseConf } from './base-conf';
import { N9LogOptions } from './implementations/n9-node-log.implementation';
import { APMOptions } from './options-apm';
import { ConfOptions } from './options-conf';
import { HttpOptions } from './options-http';
import { JWTOptions } from './options-jwt';
import { PrometheusOptions } from './options-prometheus';
import { SentryOptions } from './options-sentry';
import { ShutdownOptions } from './options-shutdown';
import { SwaggerOptions } from './options-swagger';

export class Options<ConfType extends N9NodeRoutingBaseConf = N9NodeRoutingBaseConf> {
	@IsOptional()
	@IsBoolean()
	hasProxy?: boolean;

	@IsOptional()
	@IsBoolean()
	enableRequestId?: boolean;

	@IsOptional()
	@IsBoolean()
	enableLogFormatJSON?: boolean;

	@IsOptional()
	@IsString()
	path?: string;

	@IsOptional()
	@ValidateNested()
	@Type(() => ConfOptions)
	conf?: ConfOptions<ConfType>;

	@IsOptional()
	@ValidateNested()
	@Type(() => N9Log)
	log?: N9Log;

	@IsOptional()
	@ValidateNested()
	@Type(() => N9LogOptions)
	logOptions?: N9LogOptions;

	@IsOptional()
	@ValidateNested()
	@Type(() => HttpOptions)
	http?: HttpOptions;

	@IsOptional()
	@ValidateNested()
	@Type(() => JWTOptions)
	jwt?: JWTOptions;

	@IsOptional()
	@ValidateNested()
	@Type(() => SwaggerOptions)
	openapi?: SwaggerOptions;

	@IsOptional()
	@ValidateNested()
	@Type(() => ShutdownOptions)
	shutdown?: ShutdownOptions;

	@IsOptional()
	@ValidateNested()
	@Type(() => PrometheusOptions)
	prometheus?: PrometheusOptions;

	@IsOptional()
	@ValidateNested()
	@Type(() => SentryOptions)
	sentry?: SentryOptions;

	@IsOptional()
	@ValidateNested()
	@Type(() => APMOptions)
	apm?: APMOptions;

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	firstSequentialInitFileNames?: string[];

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	firstSequentialStartFileNames?: string[];
}
