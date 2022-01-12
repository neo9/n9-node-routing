import { N9Log } from '@neo9/n9-node-log';
import * as express from 'express';

import { N9NodeRouting } from './models/routing.models';

export function initAPM(options: N9NodeRouting.APMOptions, log: N9Log): void {
	if (options.type === 'newRelic') {
		log.info(`Enable NewRelic for app ${options.newRelicOptions.appName}`);
		// eslint-disable-next-line @typescript-eslint/no-var-requires,global-require
		const newRelic = require('newrelic');
		newRelic.instrumentLoadedModule('express', express);
		try {
			// eslint-disable-next-line @typescript-eslint/no-var-requires,global-require,import/no-extraneous-dependencies
			const mongodb = require('mongodb');
			newRelic.instrumentLoadedModule('mongodb', mongodb);
		} catch (e) {
			log.debug(`MongoDB module is not instrumented`);
		}
	}
}
