import { Transform } from 'class-transformer';
import { Allow, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

import { N9NodeRouting, Type } from '../../../../../src';
import { SecretTransformer, SecretType } from '../../../../../src/transformer/secert.transformer';

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
	@Transform(SecretTransformer.GET_TRANSFORMER())
	secret?: string;

	@Allow()
	@Transform(SecretTransformer.GET_TRANSFORMER(SecretType.OPAQUE))
	secretOpaque?: string;

	@Allow()
	@Transform(SecretTransformer.GET_TRANSFORMER(SecretType.OPAQUE))
	secretOpaqueNil?: string;

	@Allow()
	@Transform(SecretTransformer.GET_TRANSFORMER(SecretType.INVISIBLE))
	secretInvisible?: string;

	@Allow()
	@Transform(SecretTransformer.GET_TRANSFORMER(SecretType.URI))
	secretUri?: string;

	@Allow()
	@Transform(SecretTransformer.GET_TRANSFORMER(SecretType.URI))
	secretUriNotAnURI?: string;
}
