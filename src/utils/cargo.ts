import { N9Error } from '@neo9/n9-node-utils';
import * as Async from 'async';

export class Cargo<
	RESPONSE extends object = { _id: string },
	REQUEST extends object | string = string,
> {
	private cargoQueue: Async.QueueObject<REQUEST>;

	/**
	 * Return a new cargo wich can be use to automatically batch tasks executions.
	 * This cargo rely on the caolan/async cargoQueue.
	 * Documentation can be found here https://caolan.github.io/async/v3/docs.html#cargoQueue
	 * This cargo only add the dispatch logic to return the unitary response
	 * in the Promise resolution from the batched responses provided by the workers
	 *
	 * Every time a request is added if a worker is available it will handle the request
	 * if no worker is available the request will be kept to be handled by the next available worker.
	 * This allow minimal overhead when the request frequency is low, and allow to batch more request
	 * when the request rate increases.
	 *
	 * The add method take a REQUEST as parameter and returns a Promise that will be resolved with a value of type RESPONSE.
	 * The workerFn must handle a batch of REQUEST type. After the workerFn returns, the response will be forward to the dispatch
	 * method to match requests with corresponding values.
	 * The dispatchFn must find for a REQUEST the corresponding values in the workerFn response. it returns a value of type RESPONSE.
	 *
	 * REQUEST and RESPONSE can be objects,
	 *
	 * @param cargoType : string used for logging purpose
	 * @param workerFn asynchronous function : used to handle a bask of requests. The result will be forward to the dispatch function
	 * @param dispatchFn synchronous function : that maps batched response values to unitary requests <br />
	 * dispatch function accept a request, all response and give the corresponding response for a request <br />
	 * default : map using _id property
	 * @param throwOnEmptyValue boolean : if true an exception will be throw if not value can be dispatched for a request
	 * @param nbMaxConcurrentWorkers number : default 2 : max number of active worker
	 * @param taskPerWorker number : default 200 : max number of request that a worker can handle in one batch
	 */
	constructor(
		private cargoType: string,
		private workerFn: (requests: REQUEST[]) => Promise<any>,
		private readonly dispatchFn?: (request: REQUEST, responses: any) => RESPONSE,
		private throwOnEmptyValue: boolean = false,
		nbMaxConcurrentWorkers: number = 2,
		taskPerWorker: number = 200,
	) {
		this.cargoQueue = Async.cargoQueue(
			async (requests: REQUEST[]) => {
				try {
					const responses = await this.workerFn(requests);
					return responses;
				} catch (e) {
					throw new N9Error(`cargo-${this.cargoType}-worker-error`, e.status || 500, {
						requests,
						error: e,
						cargoType: this.cargoType,
					});
				}
			},
			nbMaxConcurrentWorkers,
			taskPerWorker,
		);

		if (!this.dispatchFn) {
			this.dispatchFn = (request: REQUEST, responses: any[]): any => {
				if (typeof request === 'string') {
					return responses.find((response) => response._id === request);
				}
				return responses.find((response) => response._id === (request as any).id);
			};
		}
	}

	public async get(request: REQUEST): Promise<RESPONSE> {
		return new Promise((resolve, reject) => {
			/**
			 * we use callback method since the push method doesn't work with promises
			 */
			this.cargoQueue.push(request, (error: Error, responses: RESPONSE[]) => {
				if (error) {
					return reject(error);
				}

				try {
					const value = this.dispatchFn(request, responses);
					if (this.throwOnEmptyValue && (value === undefined || value === null)) {
						return reject(
							new N9Error(`cargo-${this.cargoType}-value-not-found`, 404, {
								request,
								cargoType: this.cargoType,
							}),
						);
					}
					resolve(value);
				} catch (e) {
					return reject(
						new N9Error(`cargo-${this.cargoType}-dispatch-error`, 500, {
							request,
							responses,
							dispatchFn: this.dispatchFn.toString(),
							error: e,
							cargoType: this.cargoType,
						}),
					);
				}
			});
		});
	}
}
