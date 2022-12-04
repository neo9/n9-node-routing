import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { Request, Response } from 'express';

export class PrometheusOptions {
	@IsOptional()
	@IsNumber()
	port?: number;

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	labels?: string[];

	// No validation because it should be in the conf but passed to the constructor as an option
	getLabelValues?: (req: Request, res: Response) => { [label: string]: string };

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	accuracies?: string[];

	// No validation because it should be in the conf but passed to the constructor as an option
	skip?: (req: Request, res: Response, labels: string[]) => boolean;
}
