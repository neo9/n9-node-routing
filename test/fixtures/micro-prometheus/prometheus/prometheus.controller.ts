import { waitFor } from '@neo9/n9-node-utils';

import { Get, JsonController, Post, Service } from '../../../../src';

@Service()
@JsonController()
export class PrometheusController {
	@Get('/sample-route')
	public voidRoute(): void {
		return;
	}

	@Get('/by-code/:code')
	public getSomethingByCode(): void {
		return;
	}

	@Post('/a-long-route/:code')
	public async getSomethingLongByCode(): Promise<void> {
		await waitFor(1_000); // 1s
	}
}
