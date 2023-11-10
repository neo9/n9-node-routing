import { Transform } from 'class-transformer';
import { Allow, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

import { N9NodeRouting, SecretTransformer, SecretType, Type } from '../../../../../src';

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
	@Transform(SecretTransformer.GET_TRANSFORMER(SecretType.OPAQUE, { each: true }))
	secretOpaqueArray?: string[];

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
	@Transform(SecretTransformer.GET_TRANSFORMER(SecretType.URI, { each: true }))
	secretUriArray?: string[];

	@Allow()
	@Transform(SecretTransformer.GET_TRANSFORMER(SecretType.URI))
	secretUriWithoutPassword?: string;

	@Allow()
	@Transform(SecretTransformer.GET_TRANSFORMER(SecretType.URI, { each: true }))
	secretUriWithoutPasswordArray?: string[];

	@Allow()
	@Transform(SecretTransformer.GET_TRANSFORMER(SecretType.URI))
	secretUriNotAnURI?: string;
}
