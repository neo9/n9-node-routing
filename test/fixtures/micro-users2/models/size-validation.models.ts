import { Exclude, Expose, Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import * as _ from 'lodash';

@Exclude()
export class SizeValidation {
	@IsOptional()
	@Min(1)
	@Max(200)
	@IsInt()
	@Expose()
	@Transform(({ value }) => (_.isNil(value) ? value : Number.parseInt(value, 10)), {
		toClassOnly: true,
	})
	public size: number;
}
