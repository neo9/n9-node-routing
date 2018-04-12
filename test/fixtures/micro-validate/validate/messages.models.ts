import { Allow, IsISO8601, IsString, MinLength } from 'class-validator';
import { Expose, Exclude } from 'class-transformer';
import { DateParser } from '../../../../src';

export class Message {
	@IsISO8601()
	@DateParser()
	public date: Date;

	@IsString()
	public body: string;
}
