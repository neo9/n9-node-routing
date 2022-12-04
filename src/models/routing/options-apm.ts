import { Type } from 'class-transformer';
import { IsIn, IsOptional, IsString, ValidateNested } from 'class-validator';

export class NewRelicOptions {
	@IsOptional()
	@IsString()
	appName?: string;

	@IsOptional()
	@IsString()
	licenseKey?: string;
}

export class APMOptions {
	@IsOptional()
	@IsString()
	@IsIn(['newRelic'])
	type?: 'newRelic'; // add other later

	// new relic doesn't allow to pass options at the runtime
	// it's only possible through newrelic.js file or env variable
	@IsOptional()
	@ValidateNested()
	@Type(() => NewRelicOptions)
	newRelicOptions?: NewRelicOptions;
}
