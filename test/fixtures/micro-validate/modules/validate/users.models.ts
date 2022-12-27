import { Allow, MinLength } from 'class-validator';

export class User {
	@Allow()
	@MinLength(2)
	public username: string;
}
