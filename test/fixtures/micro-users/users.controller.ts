import { N9Error } from '@neo9/n9-node-utils';
import { Body, Controller, Get, Param, Post, Session, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiConflictResponse, ApiOperation } from '@nestjs/swagger';
import { Acl, SessionAuthGuard } from '../../../src';
import { TokenContent } from './models/token-content.models';
import { User } from './models/users.models';
import { UsersService } from './users.service';

@Controller('/users')
export class UsersController {

	constructor(private usersService: UsersService) {
	}

	@ApiOperation({ title: 'createUser', description: 'The record has been successfully created.' })
	@ApiBadRequestResponse({ description: 'Bad Request' })
	@ApiConflictResponse({ description: 'User email already exist' })
	@Acl([{ action: 'createUser' }])
	@Post()
	public async createUser(@Session() session: TokenContent, @Body() user: User): Promise<User> {

		// sanitize email to lowercase
		user.email = user.email.toLowerCase();
		// Check if user by email already exists
		const userExists = !!await this.usersService.getByEmail(user.email);

		if (userExists) {
			throw new N9Error('user-already-exists', 409);
		}

		// Add user to database
		const userMongo = await this.usersService.create(user, session ? session.userId : 'no-auth-user');

		delete userMongo.password;
		// Send back the user created
		return userMongo;
	}

	@UseGuards(SessionAuthGuard)
	@Get('/:id')
	public async getUserById(@Param('id') userId: string): Promise<User> {
		// Check if user exists
		const user = await this.usersService.getById(userId);
		if (!user) {
			throw new N9Error('user-not-found', 404);
		}
		delete user.password;
		// Send back the user
		return user;
	}
}
