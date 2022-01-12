import { MongoUtils } from '@neo9/n9-mongo-client';
import { N9Log } from '@neo9/n9-node-log';
import { N9Error } from '@neo9/n9-node-utils';
import { Express } from 'express';
import { Server } from 'http';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { join } from 'path';
import * as stdMock from 'std-mocks';
import { Container } from 'typedi';

// tslint:disable-next-line:import-name
import n9NodeRouting, { N9HttpClient, N9NodeRouting } from '../../src';
import commons, { closeServer } from './commons';

export async function init(
	folder: string,
	startMongoDB: boolean = false,
	options?: N9NodeRouting.Options,
): Promise<{ app: Express; server: Server; httpClient: N9HttpClient }> {
	stdMock.use({ print: commons.print });
	const microUsers = join(__dirname, `${folder}/`);
	(global as any).log = new N9Log('test');

	// Set env to 'test'
	process.env.NODE_ENV = 'test';

	if (startMongoDB) {
		const mongodServer = new MongoMemoryServer({
			binary: {
				version: '4.2.2',
			},
			// debug: true,
		});
		const mongoConnectionString = await mongodServer.getUri();
		const db = await MongoUtils.connect(mongoConnectionString);
		Container.set('db', db);
		(global as any).db = db;
	} else {
		delete (global as any).db;
	}

	const { app, server } = await n9NodeRouting({
		path: microUsers,
		...options,
	});
	const httpClient = new N9HttpClient((global as any).log);
	return { app, server, httpClient };
}

export const urlPrefix = 'http://localhost:5000';

export async function end(server: Server): Promise<void> {
	stdMock.restore();
	stdMock.flush();
	// Close server
	await closeServer(server);
}

function getHttpClient(responseType: 'text' | 'json'): N9HttpClient {
	return new N9HttpClient((global as any).log ?? new N9Log('test'), { responseType });
}

function concatBasePath(path: string = '/'): string {
	return `${urlPrefix}${join('/', path)}`;
}

async function wrapLogs<T>(
	apiCall: Promise<T>,
): Promise<{ body: T; err: N9Error; stdout: string[]; stderr: string[] }> {
	// Store logs output
	stdMock.use({ print: commons.print });
	// Call API & check response
	let body = null;
	let err = null;
	try {
		body = await apiCall;
	} catch (error) {
		err = error;
	}
	// Get logs ouput & check logs
	const { stdout, stderr } = stdMock.flush();
	// Restore logs output
	stdMock.restore();
	return { body, err, stdout, stderr };
}

export async function get<T extends string | object = object>(
	path: string,
	responseType: 'text' | 'json' = 'json',
	queryParams?: object,
	headers?: object,
): Promise<{
	body: T;
	err: N9Error;
	stdout: string[];
	stderr: string[];
}> {
	const httpClient = getHttpClient(responseType);
	return await wrapLogs<T>(httpClient.get<T>(concatBasePath(path), queryParams, headers));
}

// istanbul ignore next
export async function post<T>(
	path: string,
	body: any,
): Promise<{
	body: T;
	err: N9Error;
	stdout: string[];
	stderr: string[];
}> {
	const httpClient = getHttpClient('json');
	return await wrapLogs<T>(httpClient.post<T>(concatBasePath(path), body));
}

// istanbul ignore next
export async function put<T>(
	path: string,
	body: any,
): Promise<{
	body: T;
	err: N9Error;
	stdout: string[];
	stderr: string[];
}> {
	const httpClient = getHttpClient('json');
	return await wrapLogs<T>(httpClient.put<T>(concatBasePath(path), body));
}

export function logErrorForHuman(err: Error): void {
	stdMock.use({ print: commons.print });
	((global as any).log as N9Log)
		.module('local', { formatJSON: false })
		.error(`Error `, JSON.stringify(err, null, 2));
	stdMock.restore();
}
