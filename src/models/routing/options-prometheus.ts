import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class PrometheusOptions {
	@IsOptional()
	@IsBoolean()
	isEnabled?: boolean;

	@IsOptional()
	@IsNumber()
	port?: number;

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	labels?: string[];

	// No validation because it shouldn't be in the conf but passed to the constructor as an option
	getLabelValues?: (req: any, res: any) => { [label: string]: string };

	// No validation because it shouldn't be in the conf but passed to the constructor as an option
	skip?: (req: any, res: any, labels: Record<string, string | number>) => boolean;
}
