import { N9Log } from '@neo9/n9-node-log';
import { IsBoolean, IsIn, IsInstance, IsOptional, IsString } from 'class-validator';

export class N9LogOptions implements N9Log.Options {
	@IsOptional()
	@IsIn(['silent', 'error', 'warn', 'info', 'debug', 'trace'])
	level?: N9Log.Level;

	@IsOptional()
	@IsBoolean()
	console?: boolean;

	@IsOptional()
	@IsBoolean()
	formatJSON?: boolean;

	@IsOptional()
	@IsString()
	developmentOutputFilePath?: string;

	@IsOptional()
	@IsInstance(Function, { each: true })
	filters?: N9Log.Filter[];
}
