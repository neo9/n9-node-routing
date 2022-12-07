import { N9ConfMergeStrategy, N9ConfOptions } from '@neo9/n9-node-conf';
import { Type } from 'class-transformer';
import { IsEnum, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

import { N9NodeRouting } from '../../..';

export class N9NodeConfOptionsExtendConfigPath {
	@IsOptional()
	@IsString()
	absolute?: string;

	@IsOptional()
	@IsString()
	relative?: string;
}

export class N9NodeConfOptionsExtendConfig {
	@ValidateNested()
	@Type(() => N9NodeConfOptionsExtendConfigPath)
	path: N9NodeConfOptionsExtendConfigPath;

	@IsOptional()
	@IsString()
	key?: string;

	@IsOptional()
	@IsEnum(N9ConfMergeStrategy)
	mergeStrategy?: N9ConfMergeStrategy;
}

export class N9NodeConfOptionsOverride<ConfType extends object> {
	@IsObject()
	value: ConfType;

	@IsOptional()
	@IsEnum(N9ConfMergeStrategy)
	mergeStrategy?: N9ConfMergeStrategy;
}

export class N9NodeConfOptions<ConfType extends N9NodeRouting.N9NodeRoutingBaseConf>
	implements N9ConfOptions
{
	@IsOptional()
	@IsString()
	path?: string;

	@IsOptional()
	@ValidateNested()
	@Type(() => N9NodeConfOptionsExtendConfig)
	extendConfig?: N9NodeConfOptionsExtendConfig;

	@IsOptional()
	@IsString()
	overridePackageJsonDirPath?: string;

	/**
	 * Override the conf at the end of loading.
	 */
	@IsOptional()
	@ValidateNested()
	@Type(() => N9NodeConfOptionsOverride)
	override?: N9NodeConfOptionsOverride<ConfType>;
}
