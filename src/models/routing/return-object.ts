import { Server } from 'node:http';

import { N9Log } from '@neo9/n9-node-log';
import { Express } from 'express';

import { N9NodeRoutingBaseConf } from './base-conf';

export interface ReturnObject<ConfType extends N9NodeRoutingBaseConf = N9NodeRoutingBaseConf> {
	app: Express;
	server: Server;
	prometheusServer: Server;
	logger: N9Log;
	conf: ConfType;
}
