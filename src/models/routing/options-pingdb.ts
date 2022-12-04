import { Allow, IsOptional, IsString } from 'class-validator';

export class PingDb {
	@IsString()
	name: string;

	// No validation because it should be in the conf but passed to the constructor as an option
	isConnected: () => boolean | Promise<boolean>;

	@IsOptional()
	@Allow()
	thisArg?: any;
}
