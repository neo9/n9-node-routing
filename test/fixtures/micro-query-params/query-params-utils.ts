export class QueryParamsUtils {
	public static CAST_ARRAY({ value }: any): any[] {
		if (Array.isArray(value) || value === undefined || value === null) {
			return value;
		}
		return [value];
	}
}
