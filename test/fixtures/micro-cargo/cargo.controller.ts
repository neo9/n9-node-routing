import { Get, JsonController, QueryParam, Res } from '@flyacts/routing-controllers';
import { N9JSONStreamResponse, waitFor } from '@neo9/n9-node-utils';
import { Service } from 'typedi';

@Service()
@JsonController('/users')
export class UsersController {
	@Get('/by-multiple-ids')
	public async getUsersByIds(
		@QueryParam('ids', { validate: false, type: String }) idsParam: string[] | string = [],
	): Promise<N9JSONStreamResponse<{ _id: string }>> {
		const ids: string[] = Array.from(
			new Set(Array.isArray(idsParam) ? idsParam : [idsParam] || []),
		);

		// simulate id 404 not found
		if (ids.includes('404')) {
			const index = ids.findIndex((id) => id === '404');
			ids.splice(index, 1);
		}

		await waitFor(100);

		return {
			items: ids.map((id) => ({
				_id: id,
			})),
			count: ids.length,
			total: ids.length,
		};
	}
}
