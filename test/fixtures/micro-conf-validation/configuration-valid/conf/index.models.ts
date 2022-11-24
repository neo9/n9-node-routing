import { IsNumber, IsOptional, IsString } from 'class-validator';

// TODO: remove when n9-node-conf interfaces will be transformed in class
export class N9ConfBaseConf {
	@IsOptional()
	env?: string;

	@IsOptional()
	name?: string;

	@IsOptional()
	version?: string;
}

export class Conf extends N9ConfBaseConf {
	@IsOptional()
	@IsString()
	foo?: string;

	@IsNumber()
	bar?: number;
}
