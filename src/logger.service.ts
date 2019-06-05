import { N9Log } from '@neo9/n9-node-log';
import { LoggerService } from '@nestjs/common';

export class N9NodeRoutingLoggerService implements LoggerService {

	constructor(private logger: N9Log, name: string) {
		this.logger = logger.module(name);
	}

	public debug(message: any, context?: string): any {
		if (context) this.logger.module(context).debug(message);
		else this.logger.debug(message);
	}

	public error(message: any, trace?: string, context?: string): any {
		if (context) this.logger.module(context).error(message, { trace });
		else this.logger.error(message, { trace });
	}

	public log(message: any, context?: string): any {
		if (context) this.logger.module(context).info(message);
		else this.logger.info(message);
	}

	public verbose(message: any, context?: string): any {
		if (context) this.logger.module(context).verbose(message);
		else this.logger.verbose(message);
	}

	public warn(message: any, context?: string): any {
		if (context) this.logger.module(context).warn(message);
		else this.logger.warn(message);
	}

}
