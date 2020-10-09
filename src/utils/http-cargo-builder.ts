import { N9JSONStreamResponse } from '@neo9/n9-node-utils';
import { Container } from 'typedi';
import { Cargo } from './cargo';
import { N9HttpClient } from './http-client-base';

export class HttpCargoBuilder {
	public static BUILD<RESPONSE extends object = { _id: string }>(
		cargoOptions: {
			cargoType: string;
			workerFn?: (requests: string[]) => Promise<any>;
			dispatchFn?: (request: string, responses: any) => RESPONSE;
			throwOnEmptyValue?: boolean;
			nbMaxConcurrentWorkers?: number;
			taskPerWorker?: number;
		},
		urlGetMultiple: string | string[],
		keyName: string,
		objectKey: string = '_id',
	): Cargo<RESPONSE> {
		const httpClient = Container.get<N9HttpClient>('N9HttpClient');
		cargoOptions.workerFn =
			cargoOptions.workerFn ??
			(async (keyValues: string[]): Promise<N9JSONStreamResponse<RESPONSE>> =>
				await httpClient.get<N9JSONStreamResponse<RESPONSE>>(urlGetMultiple, {
					[keyName]: keyValues,
				}));

		cargoOptions.dispatchFn =
			cargoOptions.dispatchFn ??
			((request: string, responses: N9JSONStreamResponse<RESPONSE>): any => {
				return responses.items.find((response) => response[objectKey] === request);
			});

		return new Cargo<RESPONSE>(
			`http-${cargoOptions.cargoType}`,
			cargoOptions.workerFn,
			cargoOptions.dispatchFn,
			cargoOptions.throwOnEmptyValue,
			cargoOptions.nbMaxConcurrentWorkers,
			cargoOptions.taskPerWorker,
		);
	}
}
