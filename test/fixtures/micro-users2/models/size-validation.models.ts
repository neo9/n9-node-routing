import * as _ from 'lodash';

import { Exclude, Expose, IsInt, IsOptional, Max, Min, Transform } from '../../../../src';

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
