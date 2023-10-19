import { join } from 'node:path';

import test, { ExecutionContext } from 'ava';

import { init, TestContext } from './fixtures';

const { runBeforeTest } = init('micro-lifecycle-hooks', {
	avoidBeforeEachHook: true,
});

test('[Lifecycle Hooks] init and started hooks called', async (t: ExecutionContext<TestContext>) => {
	await runBeforeTest(t, {
		n9NodeRoutingOptions: {
			logOptions: {
				level: 'debug',
			},
		},
	});

	// Logs on stdout
	let index = 4;
	t.true(t.context.stdout[index].includes('Init module feature'), 'Init module feature');
	index += 1;
	t.true(t.context.stdout[index].includes('feature init'), 'feature init');
	index += 1;
	t.true(t.context.stdout[index].includes('End init module feature'), 'End int module feature');
	index += 1;
	t.true(t.context.stdout[index].includes('Listening on port 5000'), 'Listening on port 5000');
	index += 1;
	t.true(
		t.context.stdout[index].includes('Init started module feature'),
		'Init started module feature',
	);
	index += 1;
	t.true(t.context.stdout[index].includes('feature started'), 'feature started');
	index += 1;
	t.true(
		t.context.stdout[index].includes('End init started module feature'),
		'End init started module feature',
	);
});

test('[Lifecycle Hooks] init in order', async (t: ExecutionContext<TestContext>) => {
	await runBeforeTest(t, {
		n9NodeRoutingOptions: {
			path: join(__dirname, 'fixtures/micro-lifecycle-hooks-order/'),
			firstSequentialInitFileNames: ['test-1', 'test-2'],
			firstSequentialStartFileNames: ['test-1', 'test-2'],
		},
	});

	// Logs on stdout
	let index = 4;
	t.true(t.context.stdout[index].includes('Init module feature'), 'Init module feature');
	index += 1;
	t.true(t.context.stdout[index].includes('feature init 1'), 'feature init 1');
	index += 1;
	t.true(
		t.context.stdout[index].includes('feature init after a long wait'),
		'feature init after a long wait',
	);
	index += 1;
	t.true(t.context.stdout[index].includes('Init module feature'), 'Init module feature');
	index += 1;
	t.true(t.context.stdout[index].includes('feature init 2'), 'feature init 2');
	index += 1;
	t.true(t.context.stdout[index].includes('Listening on port 5000'), 'Listening on port 5000');
	index += 1;
	t.true(
		t.context.stdout[index].includes('Init started module feature'),
		'Init started module feature',
	);
	index += 1;
	t.true(t.context.stdout[index].includes('feature started 1'), 'feature started 1');
	index += 1;
	t.true(t.context.stdout[index].includes('feature started after a long wait'), 'feature started');
	index += 1;
	t.true(
		t.context.stdout[index].includes('Init started module feature'),
		'Init started module feature',
	);
	index += 1;
	t.true(t.context.stdout[index].includes('feature started 2'), 'feature started 2');
});
