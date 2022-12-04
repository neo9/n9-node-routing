import { N9ConfBaseConf } from '@neo9/n9-node-conf';
import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';

import { Options } from './options';

export class N9NodeRoutingBaseConf implements N9ConfBaseConf {
	@IsOptional()
	@IsString()
	env?: string;

	@IsOptional()
	@IsString()
	name?: string;

	@IsOptional()
	@IsString()
	version?: string;

	@IsOptional()
	@ValidateNested()
	@Type(() => Options)
	n9NodeRoutingOptions?: Options<this>;
}
