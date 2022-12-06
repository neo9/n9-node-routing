import { Exclude } from 'class-transformer';
import { Allow, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

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

	@Allow()
	@Exclude({ toPlainOnly: true })
	secret?: string;
}
