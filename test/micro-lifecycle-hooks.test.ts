import ava, { Assertions } from 'ava';
import { Express } from 'express';
import { Server } from 'http';
import { join } from 'path';
import * as stdMock from 'std-mocks';

// tslint:disable-next-line:import-name
import n9NodeRouting, { N9NodeRouting } from '../src';
import commons, { closeServer, defaultConfOptions } from './fixtures/commons';

async function init(
	options?: Partial<N9NodeRouting.Options>,
): Promise<{ app: Express; server: Server }> {
	stdMock.use({ print: commons.print });
	const microLifecycleHooks = join(__dirname, 'fixtures/micro-lifecycle-hooks/');
	return await n9NodeRouting({
		path: microLifecycleHooks,
		conf: defaultConfOptions,
		...options,
	});
}

ava('[Lifecycle Hooks] init and started hooks called', async (t: Assertions) => {
	const { server } = await init();

	stdMock.restore();
	const output = stdMock.flush().stdout.filter(commons.excludeSomeLogs);

	// Logs on stdout
	t.true(output[2].includes('Init module feature'), 'Init module feature');
	t.true(output[3].includes('feature init'), 'feature init');
	t.true(output[4].includes('Listening on port 5000'), 'Listening on port 5000');
	t.true(output[5].includes('Start module feature'), 'Start module feature');
	t.true(output[6].includes('feature started'), 'feature started');

	// Close server
	await closeServer(server);
});

ava('[Lifecycle Hooks] init in order', async (t: Assertions) => {
	const { server } = await init({
		path: join(__dirname, 'fixtures/micro-lifecycle-hooks-order/'),
		firstSequentialInitFileNames: ['test-1', 'test-2'],
		firstSequentialStartFileNames: ['test-1', 'test-2'],
	});

	stdMock.restore();
	const output = stdMock.flush().stdout.filter(commons.excludeSomeLogs);
	// Logs on stdout
	t.true(output[2].includes('feature init 1'), 'feature init 1');
	t.true(output[3].includes('feature init after a long wait'), 'feature init after a long wait');
	t.true(output[4].includes('feature init 2'), 'feature init 2');
	t.true(output[5].includes('Listening on port 5000'), 'Listening on port 5000');
	t.true(output[6].includes('feature started 1'), 'feature started 1');
	t.true(output[7].includes('feature started after a long wait'), 'feature started');
	t.true(output[8].includes('feature started 2'), 'feature started 2');

	// Close server
	await closeServer(server);
});
