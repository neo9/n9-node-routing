import { Exclude, Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

@Exclude()
export class QueryParamsModel {
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
	public fieldWithValue2: string = 'value';

	@Expose()
	@IsString()
	public fieldWithValue3: string = 'default-value';
}
