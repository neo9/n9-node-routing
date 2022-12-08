import { N9Log } from '@neo9/n9-node-log';
import { Type } from 'class-transformer';
import { Allow, IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Express } from 'express';
import * as morgan from 'morgan';

import { isStringOrNumber } from '../../validators/string-or-number.validator';
import { N9NodeRoutingBaseConf } from './base-conf';
import { RoutingControllersOptions } from './implementations/routing-controllers-options.implementation';
import { Options } from './options';
import { PingDb } from './options-pingdb';

class HttpPing {
	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => PingDb)
	dbs?: PingDb[];
}

export class HttpOptions<ConfType extends N9NodeRoutingBaseConf = N9NodeRoutingBaseConf> {
	@IsOptional()
	ping?: HttpPing;

	@IsOptional()
	@Allow()
	logLevel?: string | false | morgan.FormatFn;

	@IsOptional()
	@isStringOrNumber()
	port?: number | string;

	@IsOptional()
	@IsBoolean()
	preventListen?: boolean;

	@IsOptional()
	@ValidateNested()
	@Type(() => RoutingControllersOptions)
	routingController?: RoutingControllersOptions;

	// No validation because it shouldn't be in the conf but passed to the constructor as an option
	beforeRoutingControllerLaunchHook?: (
		app: Express,
		log: N9Log,
		options: Options<ConfType>,
		conf: ConfType,
	) => Promise<void> | void;

	// No validation because it shouldn't be in the conf but passed to the constructor as an option
	afterRoutingControllerLaunchHook?: (
		app: Express,
		log: N9Log,
		options: Options<ConfType>,
		conf: ConfType,
	) => Promise<void> | void;
}
