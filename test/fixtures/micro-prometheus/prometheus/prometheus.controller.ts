import { Get, JsonController } from 'routing-controllers';
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
}
