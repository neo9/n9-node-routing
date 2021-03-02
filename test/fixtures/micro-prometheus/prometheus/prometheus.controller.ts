import { waitFor } from '@neo9/n9-node-utils';
import { Get, JsonController, Post } from 'routing-controllers';
import { Service } from 'typedi';

@Service()
@JsonController()
export class PrometheusController {
	@Get('/sample-route')
	public async voidRoute(): Promise<void> {
		return;
	}

	@Get('/by-code/:code')
	public async getSomethingByCode(): Promise<void> {
		return;
	}

	@Post('/a-long-route/:code')
	public async getSomethingLongByCode(): Promise<void> {
		await waitFor(1000); // 1s
		return;
	}
}
