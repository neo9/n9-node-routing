import { Exclude, Expose } from 'class-transformer';
import {
	IsArray,
	IsBoolean,
	IsDate,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
} from 'class-validator';

@Exclude()
export class FilterQuery {
	@Expose()
	@IsString({ each: true })
	public pmString?: string[];

	@Expose()
	@IsNumber(undefined, { each: true })
	public pmNumber?: number[];

	@Expose()
	@IsDate({ each: true })
	public pmDate?: Date[];

	@Expose()
	@IsBoolean({ each: true })
	public pmBoolean?: boolean[];

	@Expose()
	public pmObject?: any[];

	@Expose()
	@IsString({ each: true })
	public pString?: string[];

	@Expose()
	@IsNumber(undefined, { each: true })
	public pNumber?: number[];

	@Expose()
	@IsDate({ each: true })
	public pDate?: Date[];

	@Expose()
	@IsBoolean({ each: true })
	public pBoolean?: boolean[];

	@Expose()
	public pObject?: any[];

	@Expose()
	@IsString()
	public q?: string;

	@Expose()
	@IsOptional()
	@IsNotEmpty()
	@IsArray()
	public p1?: string[];

	@Expose()
	@IsOptional()
	@IsNotEmpty()
	@IsArray()
	public p2?: string[];
}
