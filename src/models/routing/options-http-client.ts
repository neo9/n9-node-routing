import { Type } from 'class-transformer';
import {
	Allow,
	IsArray,
	IsBoolean,
	IsObject,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator';
import { ExtendOptions as GotOptions } from 'got';

export type HttpClientGotOptions = Omit<GotOptions, 'method'>;

export class HttpClientSensitiveHeadersOptions {
	/**
	 * Should the given sensitive headers be altered.
	 *
	 * @default true
	 */
	@IsOptional()
	@IsBoolean()
	alterSensitiveHeaders?: boolean;

	/**
	 * String or regexp to use to match the value to alter. All matching characters will be replaced with an asterisk.
	 *
	 * @default /(?!^)[\s\S](?!$)/ (replace all characters except for the first and last)
	 */
	@IsOptional()
	@Allow()
	alteringFormat?: string | RegExp;

	/**
	 * Headers to alter.
	 *
	 * @default ['Authorization']
	 */
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	sensitiveHeaders?: string[];
}

export class HttpClientOptions {
	/**
	 * Default Got options.
	 */
	@IsOptional()
	@IsObject()
	gotOptions?: HttpClientGotOptions;

	/**
	 * Options for handling sensitive headers.
	 */
	@IsOptional()
	@ValidateNested()
	@Type(() => HttpClientSensitiveHeadersOptions)
	sensitiveHeadersOptions?: HttpClientSensitiveHeadersOptions;
}
