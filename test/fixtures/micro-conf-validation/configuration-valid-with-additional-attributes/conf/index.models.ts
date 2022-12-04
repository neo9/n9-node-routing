import { IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

import { N9NodeRouting, Type } from '../../../../../src';

class Baz {
	qux: string;
}
export class Conf extends N9NodeRouting.N9NodeRoutingBaseConf {
	@IsOptional()
	@IsString()
	foo?: string;

	@IsNumber()
	bar?: number;

	@ValidateNested()
	@Type(() => Baz)
	baz?: Baz;
}
