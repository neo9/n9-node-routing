import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Class } from 'type-fest';

import { N9NodeRoutingBaseConf } from './base-conf';
import { N9NodeConfOptions } from './implementations/n9-node-conf.implementation';

export class ConfValidationOptions<ConfType extends N9NodeRoutingBaseConf = N9NodeRoutingBaseConf> {
	@IsOptional()
	@IsBoolean()
	isEnabled?: boolean;

	// No validation because it shouldn't be in the conf but passed to the constructor as an option
	classType?: Class<ConfType>;

	@IsOptional()
	@IsBoolean()
	formatValidationErrors?: boolean;

	@IsOptional()
	@IsBoolean()
	formatWhitelistErrors?: boolean;
}

export class ConfOptions<ConfType extends N9NodeRoutingBaseConf = N9NodeRoutingBaseConf> {
	@IsOptional()
	@ValidateNested()
	@Type(() => N9NodeConfOptions)
	n9NodeConf?: N9NodeConfOptions<ConfType>;

	@IsOptional()
	@ValidateNested()
	@Type(() => ConfValidationOptions)
	validation?: ConfValidationOptions<ConfType>;
}
