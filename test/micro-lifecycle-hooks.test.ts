import { N9Log } from '@neo9/n9-node-log';
import ava, { Assertions } from 'ava';
import { Express } from 'express';
import { Server } from 'http';
import { join } from 'path';
import * as stdMock from 'std-mocks';

// tslint:disable-next-line:import-name
import n9NodeRouting, { N9NodeRouting } from '../src';
import commons, { defaultNodeRoutingConfOptions } from './fixtures/commons';
import { end } from './fixtures/helper';

async function init(
	options?: Partial<N9NodeRouting.Options>,
): Promise<{ app: Express; server: Server; prometheusServer: Server }> {
	stdMock.use({ print: commons.print });
	const microLifecycleHooks = join(__dirname, 'fixtures/micro-lifecycle-hooks/');
	return await n9NodeRouting({
		path: microLifecycleHooks,
		conf: defaultNodeRoutingConfOptions,
		...options,
	});
}

ava('[Lifecycle Hooks] init and started hooks called', async (t: Assertions) => {
	const { server, prometheusServer } = await init({ log: new N9Log('test', { level: 'debug' }) });

	stdMock.restore();
	const output = stdMock.flush().stdout.filter(commons.excludeSomeLogs);

	// Logs on stdout
	let index = 4;
	t.true(output[index].includes('Init module feature'), 'Init module feature');
	index += 1;
	t.true(output[index].includes('feature init'), 'feature init');
	index += 1;
	t.true(output[index].includes('End init module feature'), 'End int module feature');
	index += 1;
	t.true(output[index].includes('Listening on port 5000'), 'Listening on port 5000');
	index += 1;
	t.true(output[index].includes('Init started module feature'), 'Init started module feature');
	index += 1;
	t.true(output[index].includes('feature started'), 'feature started');
	index += 1;
	t.true(
		output[index].includes('End init started module feature'),
		'End init started module feature',
	);
	index += 1;

	// Close server
	await end(server, prometheusServer);
});

ava('[Lifecycle Hooks] init in order', async (t: Assertions) => {
	const { server, prometheusServer } = await init({
		path: join(__dirname, 'fixtures/micro-lifecycle-hooks-order/'),
		firstSequentialInitFileNames: ['test-1', 'test-2'],
		firstSequentialStartFileNames: ['test-1', 'test-2'],
	});

	stdMock.restore();
	const output = stdMock.flush().stdout.filter(commons.excludeSomeLogs);
	// Logs on stdout
	let index = 4;
	t.true(output[index].includes('Init module feature'), 'Init module feature');
	index += 1;
	t.true(output[index].includes('feature init 1'), 'feature init 1');
	index += 1;
	t.true(
		output[index].includes('feature init after a long wait'),
		'feature init after a long wait',
	);
	index += 1;
	t.true(output[index].includes('Init module feature'), 'Init module feature');
	index += 1;
	t.true(output[index].includes('feature init 2'), 'feature init 2');
	index += 1;
	t.true(output[index].includes('Listening on port 5000'), 'Listening on port 5000');
	index += 1;
	t.true(output[index].includes('Init started module feature'), 'Init started module feature');
	index += 1;
	t.true(output[index].includes('feature started 1'), 'feature started 1');
	index += 1;
	t.true(output[index].includes('feature started after a long wait'), 'feature started');
	index += 1;
	t.true(output[index].includes('Init started module feature'), 'Init started module feature');
	index += 1;
	t.true(output[index].includes('feature started 2'), 'feature started 2');

	// Close server
	await end(server, prometheusServer);
});
