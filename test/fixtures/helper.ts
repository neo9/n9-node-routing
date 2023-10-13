import { MongoUtils } from '@neo9/n9-mongodb-client';
import { MongoClient } from '@neo9/n9-mongodb-client/mongodb';
import { N9Log } from '@neo9/n9-node-log';
import { N9Error } from '@neo9/n9-node-utils';
import test, { ExecutionContext } from 'ava';
import { Server } from 'http';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { join } from 'path';
import { register } from 'prom-client';
import * as stdMocks from 'std-mocks';
import { Container } from 'typedi';

import n9NodeRouting, { N9HttpClient, N9NodeRouting } from '../../src';
import { N9NodeRoutingBaseConf } from '../../src/models/routing';
import commons, { closeServer, nodeRoutingMinimalOptions } from './commons';

export interface CatchStdLogReturn<T> {
	stdout: string[];
	stderr: string[];
	stdLength: number;
	error?: N9Error;
	result: T;
}

export interface TestContext {
	n9NodeRoutingStartResult: N9NodeRouting.ReturnObject<N9NodeRoutingBaseConf>;
	httpClient: N9HttpClient;
	stdout: string[];
	stderr: string[];
	stdLength: number;
	runBeforeTestError: N9Error;
}

export interface MockAndCatchStdOptions {
	throwError: boolean;
}

export const urlPrefix = 'http://localhost:5000';

export async function end(server: Server | undefined, prometheusServer?: Server): Promise<void> {
	stdMocks.restore();
	stdMocks.flush();
	register.clear();

	// Close server
	if (server) await closeServer(server);
	if (prometheusServer) {
		await closeServer(prometheusServer);
	}
}

export async function mockAndCatchStd<T>(
	fn: () => Promise<T> | T,
	options?: MockAndCatchStdOptions,
): Promise<CatchStdLogReturn<T>> {
	stdMocks.use({ print: commons.print });
	let error: N9Error;
	let result: T;
	try {
		result = await fn();
	} catch (e) {
		if (e instanceof N9Error) {
			error = e;
		} else {
			error = new N9Error(e.message, 500, { srcError: e });
		}
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
		if (options?.throwError !== false) {
			throw error;
		}
	}
	const flushResult = stdMocks.flush();
	stdMocks.restore();

	const stdout = flushResult.stdout
		.flatMap((value) => {
			if (value.endsWith('\n')) return value.slice(0, -1).split('\n');
			return value.split('\n');
		})
		.filter(commons.excludeSomeLogs);
	const stderr = flushResult.stderr
		.flatMap((value) => {
			if (value.endsWith('\n')) return value.slice(0, -1).split('\n');
			return value.split('\n');
		})
		.filter(commons.excludeSomeLogs);

	const stdLength = stdout.length + stderr.length;
	return { stdout, stderr, stdLength, error, result };
}

export function parseJSONLogAndRemoveTime(logLine: string): object & {
	level: string;
	message: string;
	label: string;
} {
	const line = JSON.parse(logLine);
	delete line.timestamp;
	return line;
}

export type RunBeforeTestOptions<ConfType> = Partial<{
	n9NodeRoutingOptions: N9NodeRouting.Options<ConfType>;
	nodeEnvValue: 'test' | 'development' | 'production';
	mockAndCatchStdOptions: MockAndCatchStdOptions;
}>;

export type InitOptions<ConfType> = Partial<{
	startMongoDB: boolean;
	avoidBeforeEachHook: boolean; // if not a function runBeforeTest is returned
}> &
	RunBeforeTestOptions<ConfType>;

export type InitReturned<ConfType> = {
	runBeforeTest: (
		t: ExecutionContext<TestContext>,
		runBeforeTestOptions?: RunBeforeTestOptions<ConfType>,
	) => Promise<void>;
};

export function init<ConfType extends N9NodeRoutingBaseConf = N9NodeRoutingBaseConf>(
	folder?: string,
	initOptions?: InitOptions<ConfType>,
): InitReturned<ConfType> {
	if (initOptions?.startMongoDB) {
		let mongodServer: MongoMemoryServer;
		let mongodbClient: MongoClient;
		test.serial.before('Start MongoDB server', async () => {
			mongodServer = await MongoMemoryServer.create({
				binary: {
					version: '6.0.9',
				},
				// debug: true,
			});
			const mongoConnectionString = mongodServer.getUri();
			const connectResult = await MongoUtils.CONNECT(mongoConnectionString, {
				logger: new N9Log('mongo-client', { formatJSON: false }),
			});

			Container.set('db', connectResult.db);
			mongodbClient = connectResult.mongodbClient;
		});
		test.serial.after.always('Stop MongoDB server', async () => {
			await MongoUtils.DISCONNECT(mongodbClient, new N9Log('mongodb-disconnect'));
			await mongodServer?.stop();
		});
	}

	let oldNodeEnvValue: string;

	async function runBeforeTest<RunBeforeTestConfType = ConfType>(
		t: ExecutionContext<TestContext>,
		runBeforeTestOptions?: RunBeforeTestOptions<RunBeforeTestConfType>,
	): Promise<void> {
		const { stdout, stderr, stdLength, error, result } = await mockAndCatchStd(
			async () => {
				const microUsers = folder ? join(__dirname, `${folder}/`) : undefined;
				Container.remove(N9Log);
				if (!initOptions?.startMongoDB) {
					Container.remove('db'); // set in the helper after MongoUtils.CONNECT
				}
				Container.remove('conf');

				// Set env to 'test'
				oldNodeEnvValue = process.env.NODE_ENV;
				process.env.NODE_ENV =
					runBeforeTestOptions?.nodeEnvValue || initOptions?.nodeEnvValue || 'test';
				// Clear all prometheus metrics registered
				register.clear();

				const n9NodeRoutingStartResult = await n9NodeRouting({
					...nodeRoutingMinimalOptions,
					path: microUsers ?? undefined,
					...initOptions?.n9NodeRoutingOptions,
					...runBeforeTestOptions?.n9NodeRoutingOptions,
				});
				const httpClient = new N9HttpClient(Container.get(N9Log).module('test-http-client'));
				return {
					n9NodeRoutingStartResult,
					httpClient,
				};
			},
			runBeforeTestOptions?.mockAndCatchStdOptions ?? initOptions?.mockAndCatchStdOptions,
		);

		t.context = {
			n9NodeRoutingStartResult: result?.n9NodeRoutingStartResult,
			httpClient: result?.httpClient,
			stdout,
			stderr,
			stdLength,
			runBeforeTestError: error,
		};
	}

	if (!initOptions?.avoidBeforeEachHook) {
		test.beforeEach('Start API', async (t: ExecutionContext<TestContext>) => {
			await runBeforeTest(t);
		});
	}

	test.serial.afterEach.always('Stop server', async (t: ExecutionContext<TestContext>) => {
		process.env.NODE_ENV = oldNodeEnvValue;
		await end(
			t.context.n9NodeRoutingStartResult?.server,
			t.context.n9NodeRoutingStartResult?.prometheusServer,
		);
	});

	return {
		runBeforeTest: initOptions?.avoidBeforeEachHook ? runBeforeTest : undefined,
	};
}
