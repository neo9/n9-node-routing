import { IsNumber, IsOptional, IsString } from 'class-validator';

export class JWTOptions {
	@IsOptional()
	@IsString()
	headerKey?: string;

	@IsOptional()
	@IsString()
	secret?: string;

	@IsOptional()
	@IsNumber()
	expiresIn?: number;
}
