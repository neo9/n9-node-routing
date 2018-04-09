import { IsBoolean, IsOptional } from 'class-validator';

export class BodyBar {
	@IsBoolean()
	@IsOptional()
	public bar: boolean;
}
