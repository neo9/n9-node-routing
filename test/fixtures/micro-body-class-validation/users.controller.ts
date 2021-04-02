import { Body, JsonController, Post, Service } from '../../../src';
import { User } from './models/users.models';

@Service()
@JsonController('/users')
export class UsersController {
	@Post()
	public async createUser(@Body() user: User<any>): Promise<void> {
		return;
	}
}
