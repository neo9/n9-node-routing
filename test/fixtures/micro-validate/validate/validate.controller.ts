import { N9Error } from '@neo9/n9-node-utils';
import { Body, JsonController, Post } from 'routing-controllers';
import { Service } from 'typedi';
import { Message } from './messages.models';
import { User } from './users.models';

@Service()
@JsonController()
export class ValidateController {
	@Post('/validate')
	public async validate(@Body() user: User): Promise<any> {
		return { ok: true };
	}

	@Post('/validate-allow-all')
	public async validateOk(
		@Body({ validate: { forbidNonWhitelisted: false } }) user: User,
	): Promise<any> {
		return { ok: true };
	}

	@Post('/parse-date')
	public async parseDate(@Body() message: Message): Promise<any> {
		// istanbul ignore next
		if (message.date instanceof Date) {
			return { ok: true };
		}
		// istanbul ignore next
		throw new N9Error('wrong-parsing');
	}
}
