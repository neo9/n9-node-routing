import { Exclude, Expose } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

@Exclude()
export class BodyModel {
	@Expose()
	@IsNumber()
	public defaultNumber: number = 0;

	@Expose()
	@IsString()
	public defaultString: string = 'default-string-value-expected';

	@Expose()
	@IsNumber()
	public fieldWithValue: number = 5;

	@Expose()
	@IsString()
	@IsOptional()
	public fieldWithValue2?: string = 'value';

	@Expose()
	@IsString()
	public fieldWithValue3: string = 'default-value';
}
