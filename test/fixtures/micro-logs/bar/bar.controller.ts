import { N9Log } from '@neo9/n9-node-log';
import { Body, Get, JsonController, Post } from '@mardari/routing-controllers';
import { Inject, Service } from 'typedi';
import { Acl } from '../../../../src';

@Service()
@JsonController()
export class ValidateController {

	@Inject('logger')
	private logger: N9Log;

	@Inject('conf')
	private conf: any;

	@Get("/bar")
	public async getBar(): Promise<any> {
		this.logger.info(' message in controller');
		return this.conf;
	}

	@Get("/empty")
	public async getBar2(): Promise<void> {
		return;
	}
}
