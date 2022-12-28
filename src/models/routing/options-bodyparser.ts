import { IsBoolean, IsOptional } from 'class-validator';
import * as http from 'http';

import { isStringOrNumber } from '../../validators';

export class BodyParserOptions {
	/**
	 *   When set to true, then deflated (compressed) bodies will be inflated; when false, deflated bodies are rejected.
	 *   Defaults to true.
	 */
	@IsOptional()
	@IsBoolean()
	inflate?: boolean;

	/**
	 * Controls the maximum request body size.
	 * If this is a number, then the value specifies the number of bytes;
	 * If it is a string, the value is passed to the bytes library for parsing.
	 * Defaults to '100kb'.
	 */
	@IsOptional()
	@isStringOrNumber()
	limit?: string | number;

	/**
	 * The reviver option is passed directly to JSON.parse as the second argument. You can find more information on this argument in the MDN documentation about JSON.parse.
	 */
	reviver?: (key, value) => any;

	/**
	 * When set to true, will only accept arrays and objects; when false will accept anything JSON.parse accepts.
	 * Defaults to true.
	 */
	@IsOptional()
	strict?: boolean;

	/**
	 * The type option is used to determine what media type the middleware will parse. This option can be a string, array of strings, or a function.
	 * If not a function, type option is passed directly to the type-is library and this can be an extension name (like json), a mime type (like application/json), or a mime type with a wildcard.
	 * If a function, the type option is called as fn(req) and the request is parsed if it returns a truthy value.
	 * Defaults to application/json.
	 */
	@IsOptional()
	type?: string | string[] | ((req: http.IncomingMessage) => any);
	/**
	 * The verify option, if supplied, is called as verify(req, res, buf, encoding),
	 * where buf is a Buffer of the raw request body and encoding is the encoding of the request.
	 */
	verify?(req: http.IncomingMessage, res: http.ServerResponse, buf: Buffer, encoding: string): void;
}
