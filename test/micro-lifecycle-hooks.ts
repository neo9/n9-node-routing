import ava, { Assertions } from 'ava';
import { Express } from 'express';
import { Server } from 'http';
import { join } from 'path';
import * as stdMock from 'std-mocks';
// tslint:disable-next-line:import-name
import n9NodeRouting from '../src';
import commons, { closeServer } from './fixtures/commons';

async function init(): Promise<{ app: Express; server: Server }> {
	stdMock.use({ print: commons.print });
	const MICRO_LIFECYCLE_HOOKS = join(__dirname, 'fixtures/micro-lifecycle-hooks/');
	return await n9NodeRouting({
		path: MICRO_LIFECYCLE_HOOKS,
	});
}

ava('[Lifecycle Hooks] init and started hooks called', async (t: Assertions) => {
	const { server } = await init();

	stdMock.restore();
	const output = stdMock.flush().stdout.filter(commons.excludeSomeLogs);

	// Logs on stdout
	t.true(output[0].includes('Init module feature'), 'Init module feature');
	t.true(output[1].includes('feature init'), 'feature init');
	t.true(output[2].includes('Listening on port 5000'), 'Listening on port 5000');
	t.true(output[3].includes('Start module feature'), 'Start module feature');
	t.true(output[4].includes('feature started'), 'feature started');

	// Close server
	await closeServer(server);
});
