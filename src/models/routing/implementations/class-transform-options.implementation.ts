import { ClassTransformOptions as ClassTransformOptionsInterface, Type } from 'class-transformer';
import { TargetMap as TargetMapInterface } from 'class-transformer/types/interfaces/target-map.interface';
import {
	Allow,
	IsArray,
	IsBoolean,
	IsIn,
	IsInt,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator';

import { AnyFunction } from './utils';

export class ClassTransformOptionsTargetMap implements TargetMapInterface {
	// No validation because it shouldn't be in the conf but passed to the constructor as an option
	target: AnyFunction;

	@Allow()
	properties: {
		[key: string]: AnyFunction;
	};
}

export class ClassTransformOptions implements ClassTransformOptionsInterface {
	@IsOptional()
	@IsString()
	@IsIn(['excludeAll', 'exposeAll'])
	strategy?: 'excludeAll' | 'exposeAll';

	@IsOptional()
	@IsBoolean()
	excludeExtraneousValues?: boolean;

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	groups?: string[];

	@IsOptional()
	@IsInt()
	version?: number;

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	excludePrefixes?: string[];

	@IsOptional()
	@IsBoolean()
	ignoreDecorators?: boolean;

	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ClassTransformOptionsTargetMap)
	targetMaps?: ClassTransformOptionsTargetMap[];

	@IsOptional()
	@IsBoolean()
	enableCircularCheck?: boolean;

	@IsOptional()
	@IsBoolean()
	enableImplicitConversion?: boolean;

	@IsOptional()
	@IsBoolean()
	exposeDefaultValues?: boolean;

	@IsOptional()
	@IsBoolean()
	exposeUnsetFields?: boolean;
}
