import { IsNumber, IsOptional, IsString } from 'class-validator';

// TODO: remove when n9-node-conf interfaces will be transformed in class
export class N9ConfBaseConf {
	env?: string;

	name?: string;

	version?: string;
}

export class Conf extends N9ConfBaseConf {
	@IsOptional()
	@IsString()
	foo?: string;

	@IsNumber()
	bar?: number;
}
