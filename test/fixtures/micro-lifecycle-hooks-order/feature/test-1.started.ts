import { N9Log } from '@neo9/n9-node-log';
import { waitFor } from '@neo9/n9-node-utils';

export default async function(log: N9Log): Promise<void> {
	log.info('feature started 1');
	await waitFor(500);
	log.info('feature started after a long wait');
}
