import { Exclude, Type } from 'class-transformer';
import { Allow, IsIn, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

import { N9NodeRouting } from '../../../../../src';

class Baz {
	@IsString()
	qux: string;
}

export class Conf extends N9NodeRouting.N9NodeRoutingBaseConf {
	@IsOptional()
	@IsString()
	foo?: string;

	@IsNumber()
	@IsIn([1, 2])
	bar?: number;

	@ValidateNested()
	@Type(() => Baz)
	baz?: Baz;

	@Allow()
	@Exclude({ toPlainOnly: true })
	secret?: string;
}
