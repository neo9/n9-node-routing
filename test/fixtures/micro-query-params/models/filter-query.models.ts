import {
	IsArray,
	IsBoolean,
	IsDate,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
} from 'class-validator';
import { Exclude, Expose, Transform, Type } from '../../../../src';
import * as Utils from '../../../../src/utils';

class FilterQuerySubObject {
	@IsNumber()
	public a: number;
	@IsString()
	public s: string;
}

@Exclude()
export class FilterQuery {
	@Expose()
	@IsOptional()
	@IsString({ each: true })
	public pmString?: string[];

	@Expose()
	@IsOptional()
	@IsNumber(undefined, { each: true })
	@Type(() => Number)
	public pmNumber?: number[];

	@Expose()
	@IsOptional()
	@IsDate({ each: true })
	@Type(() => Date)
	public pmDate?: Date[];

	@Expose()
	@IsOptional()
	@IsBoolean({ each: true })
	@Transform(
		({ value }) => {
			if (Utils.isNil(value)) return;
			return Array.isArray(value) ? value.map((v) => v !== 'false') : value !== 'false';
		},
		{ toClassOnly: true },
	)
	public pmBoolean?: boolean[];

	@Expose()
	@IsOptional()
	@IsString({ each: true })
	public pString?: string[];

	@Expose()
	@IsOptional()
	@IsNumber(undefined, { each: true })
	@Type(() => Number)
	public pNumber?: number[];

	@Expose()
	@IsOptional()
	@IsDate({ each: true })
	@Type(() => Date)
	public pDate?: Date[];

	@Expose()
	@IsOptional()
	@IsBoolean({ each: true })
	@Transform(
		({ value }) => {
			if (Utils.isNil(value)) return;
			return Array.isArray(value) ? value.map((v) => v !== 'false') : value !== 'false';
		},
		{ toClassOnly: true },
	)
	public pBoolean?: boolean[];

	@Expose()
	@IsOptional()
	public pObject?: FilterQuerySubObject;

	@Expose()
	@IsOptional()
	@IsString()
	public q?: string;

	@Expose()
	@IsOptional()
	@IsOptional()
	@IsNotEmpty()
	@IsArray()
	public p1?: string[];

	@Expose()
	@IsOptional()
	@IsOptional()
	@IsNotEmpty()
	@IsArray()
	public p2?: string[];
}
