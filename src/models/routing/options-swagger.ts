import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';

export class SwaggerUi {
	@IsOptional()
	@IsString()
	customCss?: string;

	@IsOptional()
	@IsString()
	customJs?: string;

	@IsOptional()
	@IsString()
	swaggerUrl?: string;
}

export class SwaggerOptions {
	@IsOptional()
	@IsBoolean()
	isEnabled?: boolean;

	@IsOptional()
	@IsBoolean()
	generateDocumentationOnTheFly?: boolean; // default true for dev only

	@IsOptional()
	@IsString()
	jsonUrl?: string;

	@IsOptional()
	@IsString()
	jsonPath?: string;

	@IsOptional()
	@ValidateNested()
	@Type(() => SwaggerUi)
	swaggerui?: SwaggerUi;
}
