import { N9Error } from '@neo9/n9-node-utils';
import { Body, Controller, Post } from '@nestjs/common';
import { Message } from './messages.models';
import { User } from './users.models';

@Controller()
export class ValidateController {

	@Post("/validate")
	public async validate(@Body() user: User): Promise<any> {
		return { ok: true };
	}

	@Post("/parse-date")
	public async parseDate(@Body() message: Message): Promise<any> {
			// istanbul ignore next
		if (message.date instanceof Date) {
			return { ok: true };
		} else {
			// istanbul ignore next
			throw new N9Error('wrong-parsing');
		}
	}
}
