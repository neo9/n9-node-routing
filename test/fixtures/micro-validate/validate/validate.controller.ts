import { N9Error } from '@neo9/n9-node-utils';
import { Service } from 'typedi';

import { Body, JsonController, Post } from '../../../../src';
import { Message } from './messages.models';
import { User } from './users.models';

@Service()
@JsonController()
export class ValidateController {
	@Post('/validate')
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public validate(@Body() user: User): any {
		return { ok: true };
	}

	@Post('/validate-allow-all')
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public validateOk(@Body({ validate: { forbidNonWhitelisted: false } }) user: User): any {
		return { ok: true };
	}

	@Post('/parse-date')
	public parseDate(@Body() message: Message): any {
		// istanbul ignore next
		if (message.date instanceof Date) {
			return { ok: true };
		}
		// istanbul ignore next
		throw new N9Error('wrong-parsing');
	}
}
