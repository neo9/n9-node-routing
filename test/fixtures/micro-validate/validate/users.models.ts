import { Allow, MinLength } from 'class-validator';
import { Expose, Exclude } from 'class-transformer';

export class User {
	@Allow()
	@MinLength(2)
	public username: string;
}
